import type { StackFrame, StructuredErrorContext } from "../types/index.js";

const FRAMEWORK_LABELS: Record<StructuredErrorContext["framework"], string> = {
  nextjs: "Next.js",
  react: "React",
  vite: "Vite",
  unknown: "Unknown"
};

export function generateMarkdown(context: StructuredErrorContext): string {
  const sections = [
    heading(titleFor(context)),
    section("Framework", FRAMEWORK_LABELS[context.framework]),
    section("Error Type", context.errorType),
    section("Message", context.message),
    section("File", context.file),
    section("Location", locationFor(context)),
    stackSection(context.stackTrace),
    listSection("Component Stack", context.componentStack),
    section("Possible Cause", context.possibleCause),
    rawSection(context.raw)
  ].filter(Boolean);

  return `${sections.join("\n\n")}\n`;
}

function heading(value: string): string {
  return `# ${value}`;
}

function titleFor(context: StructuredErrorContext): string {
  if (context.framework === "unknown") {
    return "Runtime Error";
  }

  return `${FRAMEWORK_LABELS[context.framework]} Runtime Error`;
}

function section(title: string, value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return `## ${title}\n${value.trim()}`;
}

function listSection(title: string, values: string[] | undefined): string | undefined {
  if (!values?.length) {
    return undefined;
  }

  return `## ${title}\n${values.map((value) => `- ${value}`).join("\n")}`;
}

function stackSection(frames: StackFrame[]): string | undefined {
  if (!frames.length) {
    return undefined;
  }

  return `## Stack Trace\n\`\`\`text\n${frames.map(formatFrame).join("\n")}\n\`\`\``;
}

function rawSection(raw: string | undefined): string | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  return `## Raw Error\n\`\`\`text\n${raw.trim()}\n\`\`\``;
}

function locationFor(context: StructuredErrorContext): string | undefined {
  if (!context.file || !context.line) {
    return undefined;
  }

  return [context.file, context.line, context.column].filter(Boolean).join(":");
}

function formatFrame(frame: StackFrame): string {
  return frame.raw;
}