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
  });

  it("detects present lockfiles", async () => {
    const context = await buildRepositoryContext(
      path.join(fixturesDir, "pnpm-project"),
    );

    expect(context.lockfiles).toEqual(["pnpm-lock.yaml"]);
  });

  it("throws when the target path is not a directory", async () => {
    await expect(
      buildRepositoryContext(path.join(fixturesDir, "does-not-exist")),
    ).rejects.toThrow();
  });
});
