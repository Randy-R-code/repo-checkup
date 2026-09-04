import { mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { safeReaddir, safeReadFile } from "../../src/utils/safe-read.js";

async function createRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "repo-checkup-safe-read-"));
}

describe("safeReadFile", () => {
  it("reads a regular file inside the root", async () => {
    const root = await createRoot();
    const filePath = path.join(root, "package.json");
    await writeFile(filePath, "{}", "utf8");

    expect(await safeReadFile(root, filePath)).toBe("{}");
  });

  it("returns undefined for a missing file", async () => {
    const root = await createRoot();

    expect(
      await safeReadFile(root, path.join(root, "missing.json")),
    ).toBeUndefined();
  });

  it("returns undefined for a file larger than the size limit", async () => {
    const root = await createRoot();
    const filePath = path.join(root, "huge.json");
    await writeFile(filePath, "x".repeat(1000), "utf8");

    expect(await safeReadFile(root, filePath, 10)).toBeUndefined();
  });

  it("follows a symlink that stays inside the root", async () => {
    const root = await createRoot();
    const realFile = path.join(root, "real.json");
    const linkPath = path.join(root, "link.json");
    await writeFile(realFile, '{"ok":true}', "utf8");
    await symlink(realFile, linkPath);

    expect(await safeReadFile(root, linkPath)).toBe('{"ok":true}');
  });

  it("refuses a symlink that resolves outside the root", async () => {
    const root = await createRoot();
    const outside = await createRoot();
    const secretFile = path.join(outside, "secret.json");
    await writeFile(secretFile, '{"leaked":true}', "utf8");

    const linkPath = path.join(root, "escape.json");
    await symlink(secretFile, linkPath);

    expect(await safeReadFile(root, linkPath)).toBeUndefined();
  });

  it("refuses a circular symlink instead of throwing", async () => {
    const root = await createRoot();
    const linkA = path.join(root, "a");
    const linkB = path.join(root, "b");
    await symlink(linkB, linkA);
    await symlink(linkA, linkB);

    await expect(safeReadFile(root, linkA)).resolves.toBeUndefined();
  });
});

describe("safeReaddir", () => {
  it("lists a regular directory inside the root", async () => {
    const root = await createRoot();
    const workflowsDir = path.join(root, ".github", "workflows");
    await mkdir(workflowsDir, { recursive: true });
    await writeFile(path.join(workflowsDir, "ci.yml"), "name: CI", "utf8");

    expect(await safeReaddir(root, workflowsDir)).toEqual(["ci.yml"]);
  });

  it("returns an empty array for a missing directory", async () => {
    const root = await createRoot();

    expect(await safeReaddir(root, path.join(root, "missing"))).toEqual([]);
  });

  it("refuses a directory symlink that resolves outside the root", async () => {
    const root = await createRoot();
    const outside = await createRoot();
    await mkdir(path.join(outside, "workflows"));
    await writeFile(
      path.join(outside, "workflows", "leak.yml"),
      "name: leak",
      "utf8",
    );

    const linkPath = path.join(root, "workflows");
    await symlink(path.join(outside, "workflows"), linkPath);

    expect(await safeReaddir(root, linkPath)).toEqual([]);
  });
});
