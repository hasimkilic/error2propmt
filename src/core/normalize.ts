import type { NormalizedErrorInput } from "../types/index.js";

export function normalizeErrorInput(input: unknown): NormalizedErrorInput {
  if (typeof input === "string") {
    const message = firstMeaningfulLine(input) ?? "Unknown error";
    return { message, stack: input, raw: input };
  }

  if (input instanceof Error) {
    return {
      message: input.message || input.name || "Unknown error",
      stack: input.stack,
      raw: input.stack ?? input.message ?? String(input)
    };
  }

  if (isRecord(input)) {
    const source = "error" in input ? input.error : "reason" in input ? input.reason : input;
    if (source && source !== input) {
      const normalized = normalizeErrorInput(source);
      return {
        ...normalized,
        file: stringValue(input.filename) ?? normalized.file,
        line: numberValue(input.lineno) ?? normalized.line,
        column: numberValue(input.colno) ?? normalized.column
      };
    }

    const message = stringValue(input.message) ?? stringValue(input.name) ?? "Unknown error";
    const stack = stringValue(input.stack);
    return {
      message,
      stack,
      raw: stack ?? safeJson(input),
      file: stringValue(input.filename),
      line: numberValue(input.lineno),
      column: numberValue(input.colno)
    };
  }

  const message = input == null ? "Unknown error" : String(input);
  return { message, raw: message };
}

function firstMeaningfulLine(value: string): string | undefined {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}