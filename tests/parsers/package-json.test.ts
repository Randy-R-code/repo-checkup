import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readPackageJson } from "../../src/parsers/package-json.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(currentDir, "../../fixtures");

describe("readPackageJson", () => {
  it("parses scripts and dependencies from a valid package.json", async () => {
    const pkg = await readPackageJson(path.join(fixturesDir, "minimal"));

    expect(pkg?.name).toBe("minimal-fixture");
    expect(pkg?.scripts).toEqual({ build: "tsc" });
    expect(pkg?.dependencies).toEqual({ cac: "^7.0.0" });
    expect(pkg?.devDependencies).toEqual({ typescript: "^5.0.0" });
  });

  it("returns undefined when package.json is missing", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-"));

    const pkg = await readPackageJson(dir);

    expect(pkg).toBeUndefined();
  });
});
