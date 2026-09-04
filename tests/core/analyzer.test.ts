import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { analyze } from "../../src/core/analyzer.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(currentDir, "../../fixtures");

describe("analyze", () => {
  it("combines context, check results, and a score", async () => {
    const analysis = await analyze(path.join(fixturesDir, "vitest-project"));

    expect(analysis.context.profile).toBe("generic");
    expect(analysis.results.length).toBeGreaterThan(0);
    expect(
      analysis.results.every((result) => result.status !== "skipped"),
    ).toBe(true);
    expect(analysis.summary.score).toBeGreaterThanOrEqual(0);
    expect(analysis.summary.score).toBeLessThanOrEqual(100);
    expect(
      analysis.summary.passed +
        analysis.summary.warnings +
        analysis.summary.errors,
    ).toBe(analysis.results.length);
  });

  it("only includes results for applicable checks", async () => {
    const analysis = await analyze(path.join(fixturesDir, "minimal"));

    const typescriptResults = analysis.results.filter(
      (result) => result.category === "typescript",
    );

    // the minimal fixture has a typescript dependency, so typescript checks apply
    expect(typescriptResults.length).toBeGreaterThan(0);

    const ciResults = analysis.results.filter(
      (result) => result.category === "ci",
    );

    // no GitHub Actions workflows exist in this fixture, so only workflows-found applies
    expect(ciResults).toHaveLength(1);
    expect(ciResults[0]?.id).toBe("ci/workflows-found");
  });

  it("restricts results and the score to a single category", async () => {
    const target = path.join(fixturesDir, "minimal");
    const full = await analyze(target);
    const scoped = await analyze(target, { category: "typescript" });

    expect(
      scoped.results.every((result) => result.category === "typescript"),
    ).toBe(true);
    expect(scoped.results.length).toBeLessThan(full.results.length);
    expect(scoped.results.length).toBeGreaterThan(0);
  });
});
