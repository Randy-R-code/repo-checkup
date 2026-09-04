import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildRepositoryContext } from "../../src/core/context.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(currentDir, "../../fixtures");

describe("buildRepositoryContext", () => {
  it("builds context from package.json scripts and merged dependencies", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "minimal"),
    );

    expect(context.packageJson?.name).toBe("minimal-fixture");
    expect(context.scripts).toEqual({ build: "tsc" });
    expect(context.dependencies).toEqual({
      cac: "^7.0.0",
      typescript: "^5.0.0",
    });
    expect(context.lockfiles).toEqual([]);
    expect(context.profile).toBe("generic");
    expect(context.packageManager).toBe("unknown");
    expect(context.hasTsconfig).toBe(false);
    expect(context.tsconfig).toBeUndefined();
  });

  it("reads and parses tsconfig.json when present", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "typescript-project"),
    );

    expect(context.hasTsconfig).toBe(true);
    expect(context.tsconfig?.compilerOptions.strict).toBe(true);
    expect(context.tsconfig?.include).toEqual(["src"]);
  });

  it("detects present lockfiles and the matching package manager", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "pnpm-project"),
    );

    expect(context.lockfiles).toEqual(["pnpm-lock.yaml"]);
    expect(context.packageManager).toBe("pnpm");
  });

  it("detects an installed and configured tool", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "biome-project"),
    );

    expect(context.tooling.biome).toEqual({
      installed: true,
      configured: true,
    });
  });

  it("detects a Node.js CLI profile from the bin field", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "node-cli-package"),
    );

    expect(context.profile).toBe("node-cli");
  });

  it("throws when the target path is not a directory", async () => {
    await expect(
      buildRepositoryContext(path.join(fixturesDir, "does-not-exist")),
    ).rejects.toThrow();
  });
});
