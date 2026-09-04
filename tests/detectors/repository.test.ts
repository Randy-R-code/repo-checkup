import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectRepositoryHygiene } from "../../src/detectors/repository.js";

describe("detectRepositoryHygiene", () => {
  it("reports nothing present by default", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-hygiene-"));

    const evidence = await detectRepositoryHygiene(dir);

    expect(evidence.hasReadme).toBe(false);
    expect(evidence.hasLicense).toBe(false);
    expect(evidence.hasGitignore).toBe(false);
    expect(evidence.hasEnvFile).toBe(false);
    expect(evidence.hasEnvExample).toBe(false);
    expect(evidence.gitignoreCoversEnvFiles).toBe(false);
  });

  it("detects README and LICENSE files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-hygiene-"));
    await writeFile(path.join(dir, "README.md"), "# Project", "utf8");
    await writeFile(path.join(dir, "LICENSE"), "MIT", "utf8");

    const evidence = await detectRepositoryHygiene(dir);

    expect(evidence.hasReadme).toBe(true);
    expect(evidence.hasLicense).toBe(true);
  });

  it("flags a .env file not covered by .gitignore", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-hygiene-"));
    await writeFile(path.join(dir, ".env"), "SECRET=1", "utf8");
    await writeFile(path.join(dir, ".gitignore"), "node_modules\n", "utf8");

    const evidence = await detectRepositoryHygiene(dir);

    expect(evidence.hasEnvFile).toBe(true);
    expect(evidence.gitignoreCoversEnvFiles).toBe(false);
  });

  it("recognizes a .gitignore entry that excludes .env files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-hygiene-"));
    await writeFile(path.join(dir, ".env"), "SECRET=1", "utf8");
    await writeFile(
      path.join(dir, ".gitignore"),
      "node_modules\n.env\n",
      "utf8",
    );

    const evidence = await detectRepositoryHygiene(dir);

    expect(evidence.gitignoreCoversEnvFiles).toBe(true);
  });
});
