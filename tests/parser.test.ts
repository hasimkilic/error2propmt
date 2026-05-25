import { describe, expect, it } from "vitest";
import { createErrorContext } from "../src/index.js";

describe("createErrorContext", () => {
  it("detects Next.js hydration errors", () => {
    const result = createErrorContext(`Error: Text content does not match server-rendered HTML.
    at Page (app/page.tsx:10:5)
    at renderWithHooks (node_modules/next/dist/compiled/react-dom/cjs/react-dom.development.js:123:45)`);

    expect(result.context.framework).toBe("nextjs");
    expect(result.context.errorType).toBe("Hydration Error");
    expect(result.context.file).toBe("app/page.tsx");
  });

  it("detects OCR-truncated hydration messages", () => {
    const result = createErrorContext(`Error: Text content does not match ¢
at Page (app/page.tsx:10:5)
at renderWithHooks (node_modules/next/di:`);

    expect(result.context.framework).toBe("nextjs");
    expect(result.context.errorType).toBe("Hydration Error");
    expect(result.context.file).toBe("app/page.tsx");
  });

  it("detects React rendering errors", () => {
    const result = createErrorContext(`Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
    at App (src/App.tsx:4:7)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)`);

    expect(result.context.framework).toBe("react");
    expect(result.context.errorType).toBe("React Rendering Error");
    expect(result.context.possibleCause).toContain("hook");
  });

  it("detects Vite build/runtime overlay errors", () => {
    const result = createErrorContext(`[plugin:vite:import-analysis] Failed to resolve import "./missing" from "src/main.tsx".
src/main.tsx:2:19
    at TransformPluginContext.error (/node_modules/vite/dist/node/chunks/dep.js:1:1)`);

    expect(result.context.framework).toBe("vite");
    expect(result.context.errorType).toBe("Build Error");
    expect(result.context.file).toBe("src/main.tsx");
  });
});