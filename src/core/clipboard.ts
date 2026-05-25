import clipboard from "clipboardy";

export async function readClipboard(): Promise<string> {
  return clipboard.read();
}

export async function writeClipboard(value: string): Promise<void> {
  await clipboard.write(value);
}