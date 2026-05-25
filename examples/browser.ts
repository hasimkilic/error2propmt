import { captureRuntimeErrors, copyPromptAndOpenAiAssistant, copyPromptToClipboard } from "error2prompt";

let latestMarkdown = "";

captureRuntimeErrors({
  onContext(context) {
    latestMarkdown = context.markdown;
    console.log(context.markdown);
  }
});

document.querySelector("#copy-ai-prompt")?.addEventListener("click", async () => {
  if (!latestMarkdown) {
    return;
  }

  await copyPromptToClipboard(latestMarkdown);
});

document.querySelector("#open-with-ai")?.addEventListener("click", async () => {
  if (!latestMarkdown) {
    return;
  }

  await copyPromptAndOpenAiAssistant(latestMarkdown, { target: "chatgpt" });
});