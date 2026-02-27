/**
 * Returns the default output directory: ~/nanobanana-images/
 * Consistent across all platforms, avoids process.cwd() issues.
 */
export declare function getOutputDirectory(): string;
/**
 * Ensures the output directory exists.
 */
export declare function ensureOutputDirectory(): Promise<string>;
/**
 * Validates that a file path resolves within one of the allowed directories.
 * Prevents path traversal attacks (e.g., ../../etc/passwd).
 */
export declare function validatePath(inputPath: string, allowedDirs: string[]): string;
/**
 * Reads an image file with size validation.
 * Returns the buffer contents.
 */
export declare function readImageFile(filePath: string): Promise<Buffer>;
/**
 * Generates a unique filename for saved images.
 * Uses crypto.randomUUID() instead of Math.random().
 */
export declare function generateFilename(prefix: string): string;
/**
 * Saves image data (base64) to the output directory.
 * Returns the full file path.
 */
export declare function saveImage(base64Data: string, prefix: string): Promise<string>;
/**
 * Detects MIME type from file extension.
 */
export declare function getMimeType(filePath: string): string;
//# sourceMappingURL=file-handler.d.ts.map