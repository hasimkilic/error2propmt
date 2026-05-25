import type { CreateErrorContextOptions, CreateErrorContextResult } from "../types/index.js";
import { createErrorContext } from "../index.js";

export interface CaptureOptions extends CreateErrorContextOptions {
  onContext(context: CreateErrorContextResult): void;
  captureConsoleError?: boolean;
}

export interface CaptureHandle {
  stop(): void;
}

export function captureRuntimeErrors(options: CaptureOptions): CaptureHandle {
  if (typeof window === "undefined") {
    return { stop() {} };
  }

  const onError = (event: ErrorEvent) => {
    options.onContext(createErrorContext(event, options));
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    options.onContext(createErrorContext(event.reason, options));
  };

  const originalConsoleError = console.error;
  const shouldCaptureConsole = options.captureConsoleError ?? true;

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  if (shouldCaptureConsole) {
    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);
      const input = args.find((arg) => arg instanceof Error) ?? args.map(String).join(" ");
      options.onContext(createErrorContext(input, options));
    };
  }

  return {
    stop() {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      if (shouldCaptureConsole) {
        console.error = originalConsoleError;
      }
    }
  };
}