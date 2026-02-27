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
// --- Model config ---
export const ALLOWED_MODELS = [
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",
];
export const DEFAULT_MODEL = "gemini-2.5-flash-image";
// --- Constants ---
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
//# sourceMappingURL=types.js.map