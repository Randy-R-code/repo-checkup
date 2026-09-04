import { mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { getCliMeta, isMainModule } from "../src/cli.js";

describe("getCliMeta", () => {
  it("returns the RepoCheckup CLI metadata", () => {
    const meta = getCliMeta();

    expect(meta.name).toBe("RepoCheckup");
    expect(meta.version).toBe("0.1.1");
    expect(meta.tagline).toBe(
      "Give your JavaScript or TypeScript repository a quick checkup.",
    );
  });
});

describe("isMainModule", () => {
  it("returns true when argv1 is the same file, invoked directly", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-cli-"));
    const filePath = path.join(dir, "cli.js");
    await writeFile(filePath, "", "utf8");

    expect(isMainModule(pathToFileURL(filePath).href, filePath)).toBe(true);
  });

  it("returns true when invoked through a symlink (regression: npm bin mechanism)", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-cli-"));
    const realFile = path.join(dir, "cli.js");
    const symlinkPath = path.join(dir, "repo-checkup");
    await writeFile(realFile, "", "utf8");
    await symlink(realFile, symlinkPath);

    // import.meta.url resolves through the symlink to the real file, while
    // argv[1] (what the shell invoked) is still the symlink path.
    expect(isMainModule(pathToFileURL(realFile).href, symlinkPath)).toBe(true);
  });

  it("returns false for an unrelated file", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-cli-"));
    const fileA = path.join(dir, "a.js");
    const fileB = path.join(dir, "b.js");
    await writeFile(fileA, "", "utf8");
    await writeFile(fileB, "", "utf8");

    expect(isMainModule(pathToFileURL(fileA).href, fileB)).toBe(false);
  });

  it("returns false when argv1 is undefined", () => {
    expect(
      isMainModule(pathToFileURL("/tmp/anything.js").href, undefined),
    ).toBe(false);
  });
});
