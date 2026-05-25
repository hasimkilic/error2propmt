export type SupportedFramework = "nextjs" | "react" | "vite" | "unknown";

export type ErrorType =
  | "Hydration Error"
  | "React Rendering Error"
  | "Vite Runtime Error"
  | "Runtime Error"
  | "Build Error"
  | "Unknown Error";

export interface StackFrame {
  raw: string;
  functionName?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface StructuredErrorContext {
  framework: SupportedFramework;
  errorType: ErrorType;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stackTrace: StackFrame[];
  componentStack?: string[];
  possibleCause?: string;
  raw?: string;
}

export interface CreateErrorContextOptions {
  framework?: SupportedFramework | "auto";
}

export type CreateErrorContextInput =
  | Error
  | string
  | unknown
  | {
      error?: unknown;
      message?: string;
      reason?: unknown;
      stack?: string;
      filename?: string;
      lineno?: number;
      colno?: number;
    };

export interface CreateErrorContextResult {
  context: StructuredErrorContext;
  markdown: string;
}

export interface NormalizedErrorInput {
  message: string;
  stack?: string;
  raw: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface FrameworkParserResult extends StructuredErrorContext {
  confidence: number;
}

export interface FrameworkParser {
  framework: Exclude<SupportedFramework, "unknown">;
  parse(input: NormalizedErrorInput): FrameworkParserResult | undefined;
}