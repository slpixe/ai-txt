import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from 'fs/promises';
import os from 'os';
import {ExecOptions} from "node:child_process";

const execAsync = promisify(exec);
const tempDir = path.join(os.tmpdir(), "ai-txt-test");

async function runCLI(args: string = "", opts: ExecOptions = {}) {
  const cliPath = path.resolve(__dirname, "index.ts");
  return execAsync(`tsx ${cliPath} ${args}`, { ...opts, cwd: tempDir });
}

describe("AI Digest CLI", () => {
  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should detect and include a binary and SVG file with correct headers", async () => {
    const binaryFile = path.join(tempDir, "test.bin");
    const svgFile = path.join(tempDir, "test.svg");
    await fs.writeFile(binaryFile, Buffer.from([0, 1, 2, 3]));
    await fs.writeFile(svgFile, "<svg></svg>");

    await runCLI(`--input ${tempDir}`);

    const codebasePath = path.join(tempDir, "codebase.md");
    const content = await fs.readFile(codebasePath, 'utf-8');

    expect(content).toContain("/ai-txt-test/test.bin");
    expect(content).toContain("This is a binary file of the type: Binary");
    expect(content).toContain("/ai-txt-test/test.svg");
    expect(content).toContain("This is a file of the type: SVG Image");
  }, 10000);
});
