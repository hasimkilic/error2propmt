import { describe, expect, it } from "vitest";
import { generateMarkdown } from "../src/core/markdown.js";

describe("generateMarkdown", () => {
  it("generates deterministic markdown with populated sections", () => {
    expect(
      generateMarkdown({
        framework: "nextjs",
        errorType: "Hydration Error",
        message: "Text content does not match server-rendered HTML.",
        file: "app/page.tsx",
        line: 10,
        column: 5,
        stackTrace: [{ raw: "at Page (app/page.tsx:10:5)", functionName: "Page", file: "app/page.tsx", line: 10, column: 5 }],
        possibleCause: "Server/client rendering mismatch in a Next.js route or component.",
        raw: "Error: Text content does not match server-rendered HTML."
      })
    ).toMatchInlineSnapshot(`
      "# Next.js Runtime Error

      ## Framework
      Next.js

      ## Error Type
      Hydration Error

      ## Message
      Text content does not match server-rendered HTML.

      ## File
      app/page.tsx

      ## Location
      app/page.tsx:10:5

      ## Stack Trace
      \`\`\`text
      at Page (app/page.tsx:10:5)
      \`\`\`

      ## Possible Cause
      Server/client rendering mismatch in a Next.js route or component.

      ## Raw Error
      \`\`\`text
      Error: Text content does not match server-rendered HTML.
      \`\`\`
      "
    `);
  });
});