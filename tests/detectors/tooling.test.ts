import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectTooling } from "../../src/detectors/tooling.js";

describe("detectTooling", () => {
  it("reports nothing installed and nothing configured by default", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tooling-"));

    const tooling = await detectTooling(dir, {});

    expect(tooling.eslint).toEqual({ installed: false, configured: false });
    expect(tooling.biome).toEqual({ installed: false, configured: false });
    expect(tooling.prettier).toEqual({ installed: false, configured: false });
  });

  it("detects a configured tool from its config file", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tooling-"));
    await writeFile(path.join(dir, "biome.json"), "{}", "utf8");

    const tooling = await detectTooling(dir, {});

    expect(tooling.biome).toEqual({ installed: false, configured: true });
  });

  it("detects an installed tool from dependencies", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-tooling-"));

    const tooling = await detectTooling(dir, { eslint: "^9.0.0" });

    expect(tooling.eslint).toEqual({ installed: true, configured: false });
  });
});
