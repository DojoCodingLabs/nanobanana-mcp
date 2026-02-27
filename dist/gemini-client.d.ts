import { type GeminiResponse, type ImageResult } from "./types.js";
/**
 * Extracts image data and text from a Gemini response.
 * Shared logic for generate and edit flows — eliminates duplication.
 */
export declare function extractImagesFromResponse(response: GeminiResponse): {
    images: Array<{
        base64: string;
        mimeType: string;
    }>;
    text: string;
};
export declare class GeminiClient {
    private client;
    private model;
    constructor();
    getModelName(): string;
    /**
     * Generate an image from a text prompt.
     */
    generateImage(prompt: string): Promise<ImageResult>;
    /**
     * Edit an image with a prompt and optional reference images.
     */
    editImage(imageBase64: string, imageMimeType: string, prompt: string, referenceImagesData?: Array<{
        base64: string;
        mimeType: string;
    }>): Promise<ImageResult>;
}
//# sourceMappingURL=gemini-client.d.ts.map