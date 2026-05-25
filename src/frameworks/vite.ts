import type { FrameworkParser, FrameworkParserResult, NormalizedErrorInput } from "../types/index.js";
import { findFileHint, firstUserFrame, parseStackTrace } from "../core/stack.js";

export const parseViteError: FrameworkParser = {
  framework: "vite",
  parse(input) {
    const raw = input.raw;
    const isVite = /vite\//i.test(raw) || /vite client/i.test(raw) || /\/@fs\//.test(raw) || /\[plugin:vite/i.test(raw);

    if (!isVite) {
      return undefined;
    }

    const frames = parseStackTrace(input.stack ?? raw);
    const frame = firstUserFrame(frames) ?? findFileHint(raw);
    const isBuild = /\[plugin:vite|failed to resolve import|transform failed/i.test(raw);

    return {
      confidence: 0.85,
      framework: "vite",
      errorType: isBuild ? "Build Error" : "Vite Runtime Error",
      message: input.message.replace(/^Error:\s*/, "").trim() || input.message,
      file: input.file ?? frame?.file,
      line: input.line ?? frame?.line,
      column: input.column ?? frame?.column,
      stackTrace: frames,
      possibleCause: isBuild ? "A Vite transform, module resolution, or plugin step failed." : undefined,
      raw
    } satisfies FrameworkParserResult;
  }
};