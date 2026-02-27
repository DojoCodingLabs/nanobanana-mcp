import { GoogleGenAI } from "@google/genai";
import {
  ALLOWED_MODELS,
  DEFAULT_MODEL,
  type AllowedModel,
  type GeminiPart,
  type GeminiResponse,
  type ImageResult,
} from "./types.js";
import { saveImage } from "./file-handler.js";

/**
 * Resolves the API key from environment variables.
 * Priority: NANOBANANA_GEMINI_API_KEY > GEMINI_API_KEY
 * Never reads from config files.
 */
function resolveApiKey(): string {
  const key = process.env.NANOBANANA_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Gemini API key not configured. Set GEMINI_API_KEY or NANOBANANA_GEMINI_API_KEY environment variable."
    );
  }
  return key;
}

/**
 * Resolves the model from environment variable with whitelist validation.
 */
function resolveModel(): AllowedModel {
  const envModel = process.env.NANOBANANA_MODEL;
  if (!envModel) {
    return DEFAULT_MODEL;
  }

  if (!(ALLOWED_MODELS as readonly string[]).includes(envModel)) {
    throw new Error(
      `Invalid model "${envModel}". Allowed models: ${ALLOWED_MODELS.join(", ")}`
    );
  }

  return envModel as AllowedModel;
}

/**
 * Extracts image data and text from a Gemini response.
 * Shared logic for generate and edit flows — eliminates duplication.
 */
export function extractImagesFromResponse(
  response: GeminiResponse
): { images: Array<{ base64: string; mimeType: string }>; text: string } {
  const images: Array<{ base64: string; mimeType: string }> = [];
  let text = "";

  const parts: GeminiPart[] = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.text) {
      text += part.text;
    }
    if (part.inlineData?.data) {
      images.push({
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || "image/png",
      });
    }
  }

  return { images, text };
}

export class GeminiClient {
  private client: GoogleGenAI;
  private model: AllowedModel;

  constructor() {
    const apiKey = resolveApiKey();
    this.client = new GoogleGenAI({ apiKey });
    this.model = resolveModel();
  }

  getModelName(): string {
    return this.model;
  }

  /**
   * Generate an image from a text prompt.
   */
  async generateImage(prompt: string): Promise<ImageResult> {
    const response = (await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    })) as GeminiResponse;

    const { images, text } = extractImagesFromResponse(response);

    if (images.length === 0) {
      return {
        filePath: "",
        base64Data: "",
        mimeType: "",
        textContent: text || "No image was generated. The model returned only text.",
      };
    }

    const firstImage = images[0];
    const filePath = await saveImage(firstImage.base64, "generated");

    return {
      filePath,
      base64Data: firstImage.base64,
      mimeType: firstImage.mimeType,
      textContent: text,
    };
  }

  /**
   * Edit an image with a prompt and optional reference images.
   */
  async editImage(
    imageBase64: string,
    imageMimeType: string,
    prompt: string,
    referenceImagesData?: Array<{ base64: string; mimeType: string }>
  ): Promise<ImageResult> {
    // Build parts: main image + reference images + prompt text
    const parts: Array<Record<string, unknown>> = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      },
    ];

    if (referenceImagesData) {
      for (const ref of referenceImagesData) {
        parts.push({
          inlineData: {
            data: ref.base64,
            mimeType: ref.mimeType,
          },
        });
      }
    }

    parts.push({ text: prompt });

    const response = (await this.client.models.generateContent({
      model: this.model,
      contents: [{ parts }],
      config: {
        responseModalities: ["Text", "Image"],
      },
    })) as GeminiResponse;

    const { images, text } = extractImagesFromResponse(response);

    if (images.length === 0) {
      return {
        filePath: "",
        base64Data: "",
        mimeType: "",
        textContent: text || "No edited image was generated.",
      };
    }

    const firstImage = images[0];
    const filePath = await saveImage(firstImage.base64, "edited");

    return {
      filePath,
      base64Data: firstImage.base64,
      mimeType: firstImage.mimeType,
      textContent: text,
    };
  }
}
