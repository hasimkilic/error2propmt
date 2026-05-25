import tesseract from "tesseract.js";
import { createErrorContext } from "../index.js";
import type { CreateErrorContextOptions, CreateErrorContextResult } from "../types/index.js";

export interface ImageErrorContextOptions extends CreateErrorContextOptions {
  lang?: string;
}

export interface ImageTextExtractionResult {
  text: string;
  confidence?: number;
}

export async function extractTextFromImage(
  imagePath: string,
  options: Pick<ImageErrorContextOptions, "lang"> = {}
): Promise<ImageTextExtractionResult> {
  const result = await tesseract.recognize(imagePath, options.lang ?? "eng");
  const text = result.data.text.trim();

  if (!text) {
    throw new Error("No readable error text was found in the image.");
  }

  return {
    text,
    confidence: result.data.confidence
  };
}

export async function createErrorContextFromImage(
  imagePath: string,
  options: ImageErrorContextOptions = {}
): Promise<CreateErrorContextResult> {
  const extracted = await extractTextFromImage(imagePath, options);
  return createErrorContext(extracted.text, options);
}