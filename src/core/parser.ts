import { parseNextJsError } from "../frameworks/nextjs.js";
import { parseReactError } from "../frameworks/react.js";
import { parseViteError } from "../frameworks/vite.js";
import type {
  FrameworkParser,
  FrameworkParserResult,
  NormalizedErrorInput,
  StructuredErrorContext,
  SupportedFramework
} from "../types/index.js";
import { findFileHint, firstUserFrame, parseStackTrace } from "./stack.js";

const parsers: FrameworkParser[] = [parseNextJsError, parseReactError, parseViteError];

export function parseErrorContext(
  input: NormalizedErrorInput,
  framework: SupportedFramework | "auto" = "auto"
): StructuredErrorContext {
  const candidates = parsers
    .filter((parser) => framework === "auto" || framework === "unknown" || parser.framework === framework)
    .map((parser) => parser.parse(input))
    .filter((result): result is FrameworkParserResult => Boolean(result))
    .sort((left, right) => right.confidence - left.confidence);

  return stripConfidence(candidates[0]) ?? parseGenericError(input);
}

function parseGenericError(input: NormalizedErrorInput): StructuredErrorContext {
  const frames = parseStackTrace(input.stack ?? input.raw);
  const frame = firstUserFrame(frames) ?? findFileHint(input.raw);

  return {
    framework: "unknown",
    errorType: input.message === "Unknown error" ? "Unknown Error" : "Runtime Error",
    message: input.message,
    file: input.file ?? frame?.file,
    line: input.line ?? frame?.line,
    column: input.column ?? frame?.column,
    stackTrace: frames,
    raw: input.raw
  };
}

function stripConfidence(result: FrameworkParserResult | undefined): StructuredErrorContext | undefined {
  if (!result) {
    return undefined;
  }

  const { confidence: _confidence, ...context } = result;
  return context;
}