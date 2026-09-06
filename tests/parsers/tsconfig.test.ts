import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readTsConfig } from "../../src/parsers/tsconfig.js";

async function createTsconfigDir(content: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tsconfig-"));

  await writeFile(path.join(dir, "tsconfig.json"), content, "utf8");

  return dir;
}

async function createProjectDir(
  files: Record<string, string>,
): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tsconfig-"));

  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(dir, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }

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

describe("readTsConfig extends resolution", () => {
  it("inherits strict from a base config", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({ extends: "./tsconfig.base.json" }),
      "tsconfig.base.json": JSON.stringify({
        compilerOptions: { strict: true },
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(true);
    expect(config?.hasUnresolvedExtends).toBe(false);
  });

  it("lets the child config override an inherited value", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({
        extends: "./tsconfig.base.json",
        compilerOptions: { strict: false },
      }),
      "tsconfig.base.json": JSON.stringify({
        compilerOptions: { strict: true },
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(false);
  });

  it("resolves multiple inheritance levels", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({ extends: "./tsconfig.mid.json" }),
      "tsconfig.mid.json": JSON.stringify({
        extends: "./tsconfig.base.json",
      }),
      "tsconfig.base.json": JSON.stringify({
        compilerOptions: { strict: true, noUncheckedIndexedAccess: true },
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(true);
    expect(config?.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(config?.hasUnresolvedExtends).toBe(false);
  });

  it("resolves a relative extends path through a subdirectory and back up, while staying within the repository root", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({
        extends: "./config/tsconfig.mid.json",
      }),
      "config/tsconfig.mid.json": JSON.stringify({
        extends: "../tsconfig.base.json",
      }),
      "tsconfig.base.json": JSON.stringify({
        compilerOptions: { strict: true },
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBe(true);
    expect(config?.hasUnresolvedExtends).toBe(false);
  });

  it("marks unresolved when the extended file is missing", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({ extends: "./tsconfig.base.json" }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBeUndefined();
    expect(config?.hasUnresolvedExtends).toBe(true);
  });

  it("marks unresolved when the extended file is malformed", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({ extends: "./tsconfig.base.json" }),
      "tsconfig.base.json": "{ not valid json ",
    });

    const config = await readTsConfig(dir);

    expect(config?.hasUnresolvedExtends).toBe(true);
  });

  it("detects an inheritance cycle without hanging", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({ extends: "./b.json" }),
      "b.json": JSON.stringify({ extends: "./tsconfig.json" }),
    });

    const config = await readTsConfig(dir);

    expect(config?.hasUnresolvedExtends).toBe(true);
  });

  it("marks unresolved when extends escapes the repository root", async () => {
    const outer = await mkdtemp(path.join(tmpdir(), "repo-checkup-outer-"));
    await writeFile(
      path.join(outer, "tsconfig.base.json"),
      JSON.stringify({ compilerOptions: { strict: true } }),
      "utf8",
    );

    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({
        extends: "../../../../../../../../etc/tsconfig.base.json",
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBeUndefined();
    expect(config?.hasUnresolvedExtends).toBe(true);
  });

  it("marks unresolved for a package-based preset without resolving into node_modules", async () => {
    const dir = await createProjectDir({
      "tsconfig.json": JSON.stringify({
        extends: "@tsconfig/node22/tsconfig.json",
      }),
    });

    const config = await readTsConfig(dir);

    expect(config?.compilerOptions.strict).toBeUndefined();
    expect(config?.hasUnresolvedExtends).toBe(true);
  });
});
