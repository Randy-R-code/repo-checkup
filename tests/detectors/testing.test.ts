import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectTesting } from "../../src/detectors/testing.js";

describe("detectTesting", () => {
  it("reports nothing installed and no test files by default", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));

    const testing = await detectTesting(dir, {});

    expect(testing.vitest.installed).toBe(false);
    expect(testing.hasTestFiles).toBe(false);
    expect(testing.hasE2eTestFiles).toBe(false);
  });

  it("detects installed runners from dependencies", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));

    const testing = await detectTesting(dir, {
      vitest: "^5.0.0",
      "@playwright/test": "^1.0.0",
    });

    expect(testing.vitest.installed).toBe(true);
    expect(testing.jest.installed).toBe(false);
    expect(testing.playwright.installed).toBe(true);
  });

  it("detects AVA and Mocha as test runners (regression: real-world false negative)", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));

    const testing = await detectTesting(dir, { ava: "^6.0.0" });

    expect(testing.ava.installed).toBe(true);
    expect(testing.mocha.installed).toBe(false);
  });

  it("finds unit test files by naming convention", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));
    await mkdir(path.join(dir, "src"), { recursive: true });
    await writeFile(path.join(dir, "src", "add.test.ts"), "export {}", "utf8");

    const testing = await detectTesting(dir, {});

    expect(testing.hasTestFiles).toBe(true);
  });

  it("finds unsuffixed test files under a test/ directory (regression: AVA convention)", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));
    await mkdir(path.join(dir, "test"), { recursive: true });
    await writeFile(path.join(dir, "test", "main.js"), "export {}", "utf8");

    const testing = await detectTesting(dir, {});

    expect(testing.hasTestFiles).toBe(true);
  });

  it("finds e2e test files under a cypress directory", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));
    await mkdir(path.join(dir, "cypress", "e2e"), { recursive: true });
    await writeFile(
      path.join(dir, "cypress", "e2e", "home.cy.ts"),
      "export {}",
      "utf8",
    );

    const testing = await detectTesting(dir, {});

    expect(testing.hasE2eTestFiles).toBe(true);
  });

  it("bounds traversal depth instead of walking a pathologically deep tree", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-testing-"));

    let deepDir = dir;
    for (let level = 0; level < 40; level += 1) {
      deepDir = path.join(deepDir, `level-${level}`);
    }
    await mkdir(deepDir, { recursive: true });
    await writeFile(path.join(deepDir, "deep.test.ts"), "export {}", "utf8");

    const start = Date.now();
    const testing = await detectTesting(dir, {});
    const duration = Date.now() - start;

    expect(testing.hasTestFiles).toBe(false);
    expect(duration).toBeLessThan(5000);
  });
});
