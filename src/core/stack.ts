import type { StackFrame } from "../types/index.js";

const STACK_FRAME_PATTERNS = [
  /^\s*at\s+(?<functionName>.*?)\s+\((?<file>.*?):(?<line>\d+):(?<column>\d+)\)\s*$/,
  /^\s*at\s+(?<file>.*?):(?<line>\d+):(?<column>\d+)\s*$/,
  /^\s*(?<functionName>.*?)@(?<file>.*?):(?<line>\d+):(?<column>\d+)\s*$/
];

export function parseStackTrace(raw: string | undefined): StackFrame[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(/\r?\n/)
    .map((line) => parseStackFrame(line))
    .filter((frame): frame is StackFrame => Boolean(frame));
}

export function parseStackFrame(line: string): StackFrame | undefined {
  const raw = line.trimEnd();
  if (!raw.trim()) {
    return undefined;
  }

  for (const pattern of STACK_FRAME_PATTERNS) {
    const match = raw.match(pattern);
    const groups = match?.groups;
    if (!groups) {
      continue;
    }

    return {
      raw,
      functionName: cleanValue(groups.functionName),
      file: cleanFile(groups.file),
      line: toNumber(groups.line),
      column: toNumber(groups.column)
    };
  }

  if (/\b(?:src|app|pages|components)\/[^\s)]+:\d+:\d+/.test(raw)) {
    const location = raw.match(/(?<file>(?:src|app|pages|components)\/[^\s)]+):(?<line>\d+):(?<column>\d+)/)?.groups;
    return {
      raw,
      file: cleanFile(location?.file),
      line: toNumber(location?.line),
      column: toNumber(location?.column)
    };
  }

  return undefined;
}

export function firstUserFrame(frames: StackFrame[]): StackFrame | undefined {
  return frames.find((frame) => {
    const file = frame.file ?? "";
    return (
      !file.includes("node_modules") &&
      !file.includes("next/dist") &&
      !file.includes("react-dom") &&
      !file.includes("vite/client")
    );
  });
}

export function findFileHint(raw: string): Pick<StackFrame, "file" | "line" | "column"> | undefined {
  const match = raw.match(/(?<file>(?:\.\/|\/)?(?:src|app|pages|components)\/[^\s)'\"]+?):(?<line>\d+):(?<column>\d+)/);
  if (!match?.groups) {
    return undefined;
  }

  return {
    file: cleanFile(match.groups.file),
    line: toNumber(match.groups.line),
    column: toNumber(match.groups.column)
  };
}

function cleanValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function cleanFile(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/^file:\/\//, "")
    .replace(/^webpack-internal:\/\/\/?/, "")
    .replace(/^\.?\//, "")
    .trim();
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}