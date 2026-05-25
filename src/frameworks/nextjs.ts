import type { FrameworkParser, FrameworkParserResult, NormalizedErrorInput } from "../types/index.js";
import { findFileHint, firstUserFrame, parseStackTrace } from "../core/stack.js";

const HYDRATION_PATTERNS = [
  /hydration/i,
  /text content does not match/i,
  /text content does not match server-rendered html/i,
  /hydrating/i,
  /server rendered html/i
];

export const parseNextJsError: FrameworkParser = {
  framework: "nextjs",
  parse(input) {
    const raw = input.raw;
    const isNext = /next(?:\.js|js)?/i.test(raw) || /next\/dist|__next|app\/(?:page|layout)\.|pages\//i.test(raw);
    const isHydration = HYDRATION_PATTERNS.some((pattern) => pattern.test(raw));

    if (!isNext && !isHydration) {
      return undefined;
    }

    const frames = parseStackTrace(input.stack ?? raw);
    const frame = firstUserFrame(frames) ?? findFileHint(raw);

    return {
      confidence: isNext && isHydration ? 0.95 : isNext ? 0.8 : 0.65,
      framework: "nextjs",
      errorType: isHydration ? "Hydration Error" : /build error|failed to compile/i.test(raw) ? "Build Error" : "Runtime Error",
      message: cleanNextMessage(input.message),
      file: input.file ?? frame?.file,
      line: input.line ?? frame?.line,
      column: input.column ?? frame?.column,
      stackTrace: frames,
      possibleCause: isHydration ? "Server/client rendering mismatch in a Next.js route or component." : undefined,
      raw
    } satisfies FrameworkParserResult;
  }
};

function cleanNextMessage(message: string): string {
  return message.replace(/^Error:\s*/, "").trim() || message;
}