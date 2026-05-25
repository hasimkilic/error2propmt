#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { cac } from "cac";
import { createErrorContext } from "../index.js";
import { readClipboard, writeClipboard } from "../core/clipboard.js";
import type { SupportedFramework } from "../types/index.js";

const cli = cac("error2prompt");

interface CliOptions {
  file?: string;
  clipboard?: boolean;
  copy?: boolean;
  print?: boolean;
  json?: boolean;
  framework?: SupportedFramework | "auto";
}

cli
  .command("[file]", "Generate an AI-ready prompt from a runtime error")
  .option("--file <path>", "Read error text from a file")
  .option("--clipboard", "Read error text from the clipboard")
  .option("--no-copy", "Do not copy generated markdown to the clipboard")
  .option("--print", "Print generated markdown to stdout")
  .option("--json", "Print structured JSON instead of markdown")
  .option("--framework <name>", "Force parser: auto, nextjs, react, vite")
  .action(async (fileArg: string | undefined, options: CliOptions) => {
    try {
      const input = await readInput(fileArg, options);
      if (!input.trim()) {
        throw new Error("No runtime error input found. Pipe text, pass a file, or copy an error to the clipboard.");
      }

      const result = createErrorContext(input, { framework: options.framework ?? "auto" });
      const output = options.json ? `${JSON.stringify(result.context, null, 2)}\n` : result.markdown;

      if (options.copy !== false && !options.json) {
        await writeClipboard(result.markdown);
      }

      if (options.print || options.json || options.copy === false) {
        process.stdout.write(output);
      } else {
        printSuccess(result.context.framework);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`error2prompt: ${message}\n`);
      process.exitCode = 1;
    }
  });

cli.help();
cli.version("0.1.0");
cli.parse();

async function readInput(fileArg: string | undefined, options: CliOptions): Promise<string> {
  const file = options.file ?? fileArg;
  if (file) {
    return readFile(file, "utf8");
  }

  if (options.clipboard) {
    return readClipboard();
  }

  const stdin = await readStdinIfPiped();
  if (stdin.trim()) {
    return stdin;
  }

  return readClipboard();
}

async function readStdinIfPiped(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function printSuccess(framework: SupportedFramework): void {
  const label = framework === "nextjs" ? "Next.js" : framework === "unknown" ? "Runtime" : framework;
  process.stdout.write(`✔ ${label} error detected\n✔ AI-ready context generated\n✔ Copied to clipboard\n`);
}