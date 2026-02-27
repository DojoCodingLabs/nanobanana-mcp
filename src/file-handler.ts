import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { MAX_FILE_SIZE_BYTES } from "./types.js";

const IMAGES_DIR_NAME = "nanobanana-images";

/**
 * Returns the default output directory: ~/nanobanana-images/
 * Consistent across all platforms, avoids process.cwd() issues.
 */
export function getOutputDirectory(): string {
  return path.join(os.homedir(), IMAGES_DIR_NAME);
}

/**
 * Ensures the output directory exists.
 */
export async function ensureOutputDirectory(): Promise<string> {
  const dir = getOutputDirectory();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Validates that a file path resolves within one of the allowed directories.
 * Prevents path traversal attacks (e.g., ../../etc/passwd).
 */
export function validatePath(inputPath: string, allowedDirs: string[]): string {
  const resolved = path.resolve(inputPath);

  const isAllowed = allowedDirs.some((dir) => {
    const resolvedDir = path.resolve(dir);
    // Must be inside the dir (resolved starts with resolvedDir + separator)
    // or be the dir itself
    return resolved === resolvedDir || resolved.startsWith(resolvedDir + path.sep);
  });

  if (!isAllowed) {
    throw new Error(
      `Path "${inputPath}" is outside allowed directories. Allowed: ${allowedDirs.join(", ")}`
    );
  }

  return resolved;
}

/**
 * Reads an image file with size validation.
 * Returns the buffer contents.
 */
export async function readImageFile(filePath: string): Promise<Buffer> {
  const stats = await fs.stat(filePath);

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${Math.round(stats.size / 1024 / 1024)}MB exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`
    );
  }

  return fs.readFile(filePath);
}

/**
 * Generates a unique filename for saved images.
 * Uses crypto.randomUUID() instead of Math.random().
 */
export function generateFilename(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const id = crypto.randomUUID().slice(0, 8);
  return `${prefix}-${timestamp}-${id}.png`;
}

/**
 * Saves image data (base64) to the output directory.
 * Returns the full file path.
 */
export async function saveImage(base64Data: string, prefix: string): Promise<string> {
  const dir = await ensureOutputDirectory();
  const fileName = generateFilename(prefix);
  const filePath = path.join(dir, fileName);

  const buffer = Buffer.from(base64Data, "base64");
  await fs.writeFile(filePath, buffer);

  return filePath;
}

/**
 * Detects MIME type from file extension.
 */
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] ?? "image/png";
}
