#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolRequest,
  type CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import os from "os";

import {
  GenerateImageArgsSchema,
  EditImageArgsSchema,
  ContinueEditingArgsSchema,
} from "./types.js";
import { GeminiClient } from "./gemini-client.js";
import {
  validatePath,
  readImageFile,
  getMimeType,
} from "./file-handler.js";

// --- Tool definitions ---

const TOOLS: Tool[] = [
  {
    name: "generate_image",
    description:
      "Generate a NEW image from a text prompt using Gemini. Use this ONLY when creating a completely new image, not when modifying an existing one.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Text prompt describing the NEW image to create from scratch (max 10,000 chars)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "edit_image",
    description:
      "Edit an existing image file with a text prompt, optionally using additional reference images. Use this when you have the exact file path of an image to modify.",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "Full file path to the image to edit",
        },
        prompt: {
          type: "string",
          description: "Text describing the modifications to make (max 10,000 chars)",
        },
        referenceImages: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional array of file paths to reference images (for style transfer, adding elements, etc.)",
        },
      },
      required: ["imagePath", "prompt"],
    },
  },
  {
    name: "continue_editing",
    description:
      "Continue editing the LAST image generated or edited in this session. Automatically uses the previous image without needing a file path. Use for iterative improvements.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Text describing changes to make to the last image (max 10,000 chars)",
        },
        referenceImages: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional array of file paths to reference images",
        },
      },
      required: ["prompt"],
    },
  },
];

// --- Allowed directories for path validation ---

function getAllowedDirs(): string[] {
  return [
    os.homedir(),
    os.tmpdir(),
  ];
}

// --- MCP Server ---

class NanoBananaMCP {
  private server: Server;
  private gemini: GeminiClient;
  private lastImagePath: string | null = null;

  constructor() {
    this.gemini = new GeminiClient();

    this.server = new Server(
      { name: "nanobanana-mcp", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest): Promise<CallToolResult> => {
        try {
          switch (request.params.name) {
            case "generate_image":
              return await this.handleGenerateImage(request);
            case "edit_image":
              return await this.handleEditImage(request);
            case "continue_editing":
              return await this.handleContinueEditing(request);
            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
              );
          }
        } catch (error) {
          if (error instanceof McpError) throw error;
          // Sanitize error messages — don't leak internal paths
          const message =
            error instanceof Error ? error.message : "Unknown error";
          throw new McpError(ErrorCode.InternalError, message);
        }
      }
    );
  }

  private async handleGenerateImage(
    request: CallToolRequest
  ): Promise<CallToolResult> {
    const parsed = GenerateImageArgsSchema.safeParse(
      request.params.arguments
    );
    if (!parsed.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        parsed.error.errors.map((e) => e.message).join("; ")
      );
    }

    const { prompt } = parsed.data;
    const result = await this.gemini.generateImage(prompt);

    if (!result.filePath) {
      return {
        content: [{ type: "text", text: result.textContent }],
      };
    }

    this.lastImagePath = result.filePath;

    const statusText = [
      `Image generated with nanobanana (${this.gemini.getModelName()})`,
      `Prompt: "${prompt.length > 100 ? prompt.slice(0, 100) + "..." : prompt}"`,
      result.textContent ? `Description: ${result.textContent}` : null,
      `Saved to: ${result.filePath}`,
      `Use continue_editing to modify this image.`,
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      content: [
        { type: "text", text: statusText },
        {
          type: "image",
          data: result.base64Data,
          mimeType: result.mimeType,
        },
      ],
    };
  }

  private async handleEditImage(
    request: CallToolRequest
  ): Promise<CallToolResult> {
    const parsed = EditImageArgsSchema.safeParse(request.params.arguments);
    if (!parsed.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        parsed.error.errors.map((e) => e.message).join("; ")
      );
    }

    const { imagePath, prompt, referenceImages } = parsed.data;
    return await this.editImageInternal(imagePath, prompt, referenceImages);
  }

  private async handleContinueEditing(
    request: CallToolRequest
  ): Promise<CallToolResult> {
    if (!this.lastImagePath) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No previous image found. Generate or edit an image first, then use continue_editing."
      );
    }

    // Verify the file still exists
    try {
      await fs.access(this.lastImagePath);
    } catch {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Last image file no longer exists. Generate a new image first."
      );
    }

    const parsed = ContinueEditingArgsSchema.safeParse(
      request.params.arguments
    );
    if (!parsed.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        parsed.error.errors.map((e) => e.message).join("; ")
      );
    }

    const { prompt, referenceImages } = parsed.data;
    return await this.editImageInternal(
      this.lastImagePath,
      prompt,
      referenceImages
    );
  }

  /**
   * Shared edit logic used by both edit_image and continue_editing.
   */
  private async editImageInternal(
    imagePath: string,
    prompt: string,
    referenceImages?: string[]
  ): Promise<CallToolResult> {
    const allowedDirs = getAllowedDirs();

    // Validate main image path
    const validatedPath = validatePath(imagePath, allowedDirs);
    const imageBuffer = await readImageFile(validatedPath);
    const mimeType = getMimeType(validatedPath);
    const imageBase64 = imageBuffer.toString("base64");

    // Validate and read reference images
    const refData: Array<{ base64: string; mimeType: string }> = [];
    if (referenceImages && referenceImages.length > 0) {
      for (const refPath of referenceImages) {
        const validatedRef = validatePath(refPath, allowedDirs);
        const refBuffer = await readImageFile(validatedRef);
        const refMime = getMimeType(validatedRef);
        refData.push({
          base64: refBuffer.toString("base64"),
          mimeType: refMime,
        });
      }
    }

    const result = await this.gemini.editImage(
      imageBase64,
      mimeType,
      prompt,
      refData.length > 0 ? refData : undefined
    );

    if (!result.filePath) {
      return {
        content: [{ type: "text", text: result.textContent }],
      };
    }

    this.lastImagePath = result.filePath;

    const statusText = [
      `Image edited with nanobanana (${this.gemini.getModelName()})`,
      `Original: ${imagePath}`,
      `Edit: "${prompt.length > 100 ? prompt.slice(0, 100) + "..." : prompt}"`,
      referenceImages?.length
        ? `Reference images: ${referenceImages.length}`
        : null,
      result.textContent ? `Description: ${result.textContent}` : null,
      `Saved to: ${result.filePath}`,
      `Use continue_editing to make further changes.`,
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      content: [
        { type: "text", text: statusText },
        {
          type: "image",
          data: result.base64Data,
          mimeType: result.mimeType,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

try {
  const server = new NanoBananaMCP();
  server.run().catch((error) => {
    process.stderr.write(`Failed to start nanobanana-mcp: ${error}\n`);
    process.exit(1);
  });
} catch (error) {
  process.stderr.write(
    `Failed to initialize nanobanana-mcp: ${error instanceof Error ? error.message : error}\n`
  );
  process.exit(1);
}
