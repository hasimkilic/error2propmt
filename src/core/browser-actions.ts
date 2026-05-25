export type AiAssistantTarget = "chatgpt" | "claude" | "gemini" | "copilot" | "cursor";

export interface OpenAiAssistantOptions {
  target?: AiAssistantTarget;
}

const ASSISTANT_URLS: Record<AiAssistantTarget, string> = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
  gemini: "https://gemini.google.com/app",
  copilot: "https://copilot.microsoft.com/",
  cursor: "https://cursor.com/"
};

export async function copyPromptToClipboard(markdown: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is not available in this environment.");
  }

  await navigator.clipboard.writeText(markdown);
}

export function openAiAssistant(options: OpenAiAssistantOptions = {}): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const target = options.target ?? "chatgpt";
  window.open(ASSISTANT_URLS[target], "_blank", "noopener,noreferrer");
  return true;
}

export async function copyPromptAndOpenAiAssistant(
  markdown: string,
  options: OpenAiAssistantOptions = {}
): Promise<boolean> {
  await copyPromptToClipboard(markdown);
  return openAiAssistant(options);
}