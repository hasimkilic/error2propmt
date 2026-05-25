import type { FrameworkParser, FrameworkParserResult, NormalizedErrorInput } from "../types/index.js";
import { findFileHint, firstUserFrame, parseStackTrace } from "../core/stack.js";

const REACT_PATTERNS = [/react-dom/i, /react\.development/i, /component stack/i, /invalid hook call/i];
const HYDRATION_PATTERNS = [/hydration/i, /text content does not match/i, /server-rendered html/i];

export const parseReactError: FrameworkParser = {
  framework: "react",
  parse(input) {
    const raw = input.raw;
    const isReact = REACT_PATTERNS.some((pattern) => pattern.test(raw));
    const isHydration = HYDRATION_PATTERNS.some((pattern) => pattern.test(raw));

    if (!isReact && !isHydration) {
      return undefined;
    }

    const frames = parseStackTrace(input.stack ?? raw);
    const frame = firstUserFrame(frames) ?? findFileHint(raw);
    const componentStack = extractComponentStack(raw);

    return {
      confidence: isReact && isHydration ? 0.9 : isReact ? 0.75 : 0.55,
      framework: "react",
      errorType: isHydration ? "Hydration Error" : "React Rendering Error",
      message: input.message.replace(/^Error:\s*/, "").trim() || input.message,
      file: input.file ?? frame?.file,
      line: input.line ?? frame?.line,
      column: input.column ?? frame?.column,
      stackTrace: frames,
      componentStack,
      possibleCause: possibleCause(raw, isHydration),
      raw
    } satisfies FrameworkParserResult;
  }
};

function extractComponentStack(raw: string): string[] | undefined {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^at\s+[A-Z][\w.]*/.test(line) || /^in\s+[A-Z][\w.]*/.test(line));

  return lines.length > 0 ? lines : undefined;
}

function possibleCause(raw: string, isHydration: boolean): string | undefined {
  if (isHydration) {
    return "Server-rendered markup differs from the client render output.";
  }

  if (/invalid hook call/i.test(raw)) {
    return "A React hook is being called outside a valid function component or custom hook.";
  }

  return undefined;
}