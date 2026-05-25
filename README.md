# error2prompt

Turn runtime errors into AI-ready prompts.

`error2prompt` converts runtime and framework error text into structured markdown that is ready to paste into ChatGPT, Cursor, Claude, Copilot, or Gemini.

It is a local, deterministic context generator for developer debugging workflows. It is not an OCR tool, screenshot parser, AI API wrapper, dashboard, or browser automation tool.

## Install

```bash
npm install error2prompt
```

## CLI

```bash
npx error2prompt
```

By default, the CLI reads from piped stdin when available. If stdin is empty, it reads the current clipboard. It generates markdown and copies the result back to the clipboard.

```bash
cat error.log | npx error2prompt
npx error2prompt ./error.log --print --no-copy
npx error2prompt --clipboard
```

Example success output:

```text
✔ Next.js error detected
✔ AI-ready context generated
✔ Copied to clipboard
```

## SDK

```ts
import { createErrorContext } from "error2prompt";

const context = createErrorContext(error);

console.log(context.markdown);
```

## Browser Capture

```ts
import { captureRuntimeErrors, copyPromptAndOpenAiAssistant } from "error2prompt";

let latestMarkdown = "";

captureRuntimeErrors({
  onContext(context) {
    latestMarkdown = context.markdown;
    console.log(context.markdown);
  }
});

document.querySelector("#open-with-ai")?.addEventListener("click", async () => {
  await copyPromptAndOpenAiAssistant(latestMarkdown, { target: "chatgpt" });
});
```

In a browser, `error2prompt` can copy the generated markdown and open an AI assistant. It does not auto-submit messages into third-party chat products because that requires an extension, API integration, or browser automation.

## Supported MVP Scope

- Next.js runtime and hydration errors
- React rendering and hydration errors
- Vite runtime/build overlay text
- Stack traces and file hints

## Non-Goals

- OCR
- screenshots
- PDFs
- cloud sync
- AI APIs
- dashboards
- authentication
- analytics
- browser automation

Screenshots are intentionally outside the core MVP. For lower token cost, prefer captured error text, stack traces, and framework metadata over image input. Screenshot-to-markdown can be added later as a separate adapter without changing the core parser.

## Example Output

````md
# Next.js Runtime Error

## Framework
Next.js

## Error Type
Hydration Error

## Message
Text content does not match server-rendered HTML.

## File
app/page.tsx

## Stack Trace
```text
at Page (app/page.tsx:10:5)
```

## Possible Cause
Server/client rendering mismatch in a Next.js route or component.
````