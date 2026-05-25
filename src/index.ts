import { generateMarkdown } from "./core/markdown.js";
import { normalizeErrorInput } from "./core/normalize.js";
import { parseErrorContext } from "./core/parser.js";
import type { CreateErrorContextInput, CreateErrorContextOptions, CreateErrorContextResult } from "./types/index.js";

export function createErrorContext(
  input: CreateErrorContextInput,
  options: CreateErrorContextOptions = {}
): CreateErrorContextResult {
  const normalized = normalizeErrorInput(input);
  const context = parseErrorContext(normalized, options.framework ?? "auto");
  const markdown = generateMarkdown(context);

  return { context, markdown };
}

export { captureRuntimeErrors } from "./core/capture.js";
export { copyPromptAndOpenAiAssistant, copyPromptToClipboard, openAiAssistant } from "./core/browser-actions.js";
export type { AiAssistantTarget, OpenAiAssistantOptions } from "./core/browser-actions.js";
export { generateMarkdown } from "./core/markdown.js";
export type * from "./types/index.js";