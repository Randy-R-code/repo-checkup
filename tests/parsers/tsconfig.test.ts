import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readTsConfig } from "../../src/parsers/tsconfig.js";

async function createTsconfigDir(content: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tsconfig-"));

  await writeFile(path.join(dir, "tsconfig.json"), content, "utf8");

  return dir;
}

describe("readTsConfig", () => {
  it("returns undefined when tsconfig.json is missing", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-"));

    expect(await readTsConfig(dir)).toBeUndefined();
  });

  it("parses compilerOptions, include, and exclude", async () => {
    const dir = await createTsconfigDir(`{
      "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true
      },
      "include": ["src"],
      "exclude": ["dist"]
    }`);

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(true);
    expect(config?.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(config?.include).toEqual(["src"]);
    expect(config?.exclude).toEqual(["dist"]);
  });

  it("tolerates comments and trailing commas (JSONC)", async () => {
    const dir = await createTsconfigDir(`{
      // strict mode
      "compilerOptions": {
        "strict": false,
      },
    }`);

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(false);
  });

  it("returns undefined when the file cannot be parsed", async () => {
    const dir = await createTsconfigDir("{ not valid json ");

    expect(await readTsConfig(dir)).toBeUndefined();
  });
});
