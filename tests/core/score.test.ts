import { describe, expect, it } from "vitest";
import { computeScore } from "../../src/core/score.js";
import type { CheckResult, CheckStatus } from "../../src/types/check.js";

function createResult(status: CheckStatus, weight: number): CheckResult {
  return {
    id: `check/${status}-${weight}`,
    category: "project",
    status,
    title: "Check",
    weight,
    message: undefined,
    recommendation: undefined,
  };
}

describe("computeScore", () => {
  it("scores 100 with no applicable results", () => {
    expect(computeScore([])).toEqual({
      score: 100,
      passed: 0,
      warnings: 0,
      errors: 0,
    });
  });

  it("scores 100 when everything passes", () => {
    const summary = computeScore([
      createResult("pass", 3),
      createResult("pass", 2),
    ]);

    expect(summary.score).toBe(100);
    expect(summary.passed).toBe(2);
  });

  it("scores 0 when everything errors", () => {
    const summary = computeScore([createResult("error", 5)]);

    expect(summary.score).toBe(0);
    expect(summary.errors).toBe(1);
  });

  it("gives warnings half credit, weighted by check weight", () => {
    const summary = computeScore([
      createResult("pass", 2),
      createResult("warning", 2),
    ]);

    // earned = 2*1 + 2*0.5 = 3, total = 4 -> 75%
    expect(summary.score).toBe(75);
    expect(summary.warnings).toBe(1);
  });

  it("excludes skipped results from both counts and the score", () => {
    const summary = computeScore([
      createResult("pass", 1),
      createResult("skipped", 10),
    ]);

    expect(summary.score).toBe(100);
    expect(summary.passed).toBe(1);
    expect(summary.warnings).toBe(0);
    expect(summary.errors).toBe(0);
  });

  it("weighs high-impact errors more than low-weight warnings", () => {
    const summary = computeScore([
      createResult("error", 5),
      createResult("warning", 1),
    ]);

    // earned = 5*0 + 1*0.5 = 0.5, total = 6 -> 8%
    expect(summary.score).toBe(8);
  });
});
