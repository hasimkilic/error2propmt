"use client";

import { useEffect, useState } from "react";
import {
  captureRuntimeErrors,
  copyPromptAndOpenAiAssistant,
  copyPromptToClipboard,
  type CreateErrorContextResult
} from "error2prompt";

export default function Error2PromptCapturePage() {
  const [latestContext, setLatestContext] = useState<CreateErrorContextResult | null>(null);
  const [copyState, setCopyState] = useState("No prompt captured yet");

  useEffect(() => {
    const capture = captureRuntimeErrors({
      onContext(context) {
        setLatestContext(context);
        setCopyState("Prompt ready");
        console.log(context.markdown);
      }
    });

    return () => capture.stop();
  }, []);

  function throwRuntimeError() {
    setTimeout(() => {
      throw new Error(
        "Manual Next.js runtime test error\n    at Page (app/error2prompt-capture/page.tsx:20:7)"
      );
    }, 0);
  }

  function logHydrationLikeError() {
    console.error(
      new Error(
        "Text content does not match server-rendered HTML.\n    at Page (app/error2prompt-capture/page.tsx:28:9)\n    at renderWithHooks (node_modules/next/dist/compiled/react-dom/cjs/react-dom.development.js:123:45)"
      )
    );
  }

  async function copyAiPrompt() {
    if (!latestContext) {
      setCopyState("Create an error first");
      return;
    }

    await copyPromptToClipboard(latestContext.markdown);
    setCopyState("Copied AI prompt");
  }

  async function openWithAiAgent() {
    if (!latestContext) {
      setCopyState("Create an error first");
      return;
    }

    await copyPromptAndOpenAiAssistant(latestContext.markdown, { target: "chatgpt" });
    setCopyState("Copied prompt and opened ChatGPT");
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>error2prompt capture test</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={throwRuntimeError}>Throw runtime error</button>
        <button onClick={logHydrationLikeError}>Log hydration-like error</button>
        <button onClick={copyAiPrompt}>Copy AI Prompt</button>
        <button onClick={openWithAiAgent}>Open With AI Agent</button>
      </div>

      <p>{copyState}</p>

      <pre style={{ whiteSpace: "pre-wrap", overflow: "auto" }}>{latestContext?.markdown}</pre>
    </main>
  );
}