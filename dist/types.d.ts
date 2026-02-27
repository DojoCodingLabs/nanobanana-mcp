import { z } from "zod";
export declare const GenerateImageArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    prompt: string;
}, {
    prompt: string;
}>;
export declare const EditImageArgsSchema: z.ZodObject<{
    imagePath: z.ZodString;
    prompt: z.ZodString;
    referenceImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    imagePath: string;
    referenceImages?: string[] | undefined;
}, {
    prompt: string;
    imagePath: string;
    referenceImages?: string[] | undefined;
}>;
export declare const ContinueEditingArgsSchema: z.ZodObject<{
    prompt: z.ZodString;
    referenceImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    referenceImages?: string[] | undefined;
}, {
    prompt: string;
    referenceImages?: string[] | undefined;
}>;
export type GenerateImageArgs = z.infer<typeof GenerateImageArgsSchema>;
export type EditImageArgs = z.infer<typeof EditImageArgsSchema>;
export type ContinueEditingArgs = z.infer<typeof ContinueEditingArgsSchema>;
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
export interface ImageResult {
    filePath: string;
    base64Data: string;
    mimeType: string;
    textContent: string;
}
export declare const ALLOWED_MODELS: readonly ["gemini-2.5-flash-image", "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"];
export type AllowedModel = (typeof ALLOWED_MODELS)[number];
export declare const DEFAULT_MODEL: AllowedModel;
export declare const MAX_FILE_SIZE_BYTES: number;
//# sourceMappingURL=types.d.ts.map