import { z } from "zod";

// --- Tool argument schemas ---

export const GenerateImageArgsSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10_000, "Prompt too long (max 10,000 chars)"),
});

export const EditImageArgsSchema = z.object({
  imagePath: z.string().min(1, "Image path is required"),
  prompt: z.string().min(1, "Prompt is required").max(10_000, "Prompt too long (max 10,000 chars)"),
  referenceImages: z.array(z.string()).optional(),
});

export const ContinueEditingArgsSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10_000, "Prompt too long (max 10,000 chars)"),
  referenceImages: z.array(z.string()).optional(),
});

export type GenerateImageArgs = z.infer<typeof GenerateImageArgsSchema>;
export type EditImageArgs = z.infer<typeof EditImageArgsSchema>;
export type ContinueEditingArgs = z.infer<typeof ContinueEditingArgsSchema>;

// --- Gemini response types ---

export interface GeminiInlineData {
  data: string;
  mimeType: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

// --- Image result ---

export interface ImageResult {
  filePath: string;
  base64Data: string;
  mimeType: string;
  textContent: string;
}

// --- Model config ---

export const ALLOWED_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3-pro-image-preview",
  "gemini-3.1-flash-image-preview",
] as const;

export type AllowedModel = (typeof ALLOWED_MODELS)[number];

export const DEFAULT_MODEL: AllowedModel = "gemini-2.5-flash-image";

// --- Constants ---

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
