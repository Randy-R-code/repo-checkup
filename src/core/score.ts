import type { CheckResult } from "../types/check.js";

export interface ScoreSummary {
  score: number;
  passed: number;
  warnings: number;
  errors: number;
}

type ScorableStatus = "pass" | "warning" | "error";

const STATUS_CREDIT: Record<ScorableStatus, number> = {
  pass: 1,
  warning: 0.5,
  error: 0,
};

function isScored(
  result: CheckResult,
): result is CheckResult & { status: ScorableStatus } {
  return result.status !== "skipped";
}

export function computeScore(results: CheckResult[]): ScoreSummary {
  const scored = results.filter(isScored);

  const passed = scored.filter((result) => result.status === "pass").length;
  const warnings = scored.filter(
    (result) => result.status === "warning",
  ).length;
  const errors = scored.filter((result) => result.status === "error").length;

  const totalWeight = scored.reduce((sum, result) => sum + result.weight, 0);

  if (totalWeight === 0) {
    return { score: 100, passed, warnings, errors };
  }

  const earnedWeight = scored.reduce(
    (sum, result) => sum + STATUS_CREDIT[result.status] * result.weight,
    0,
  );

  return {
    score: Math.round((earnedWeight / totalWeight) * 100),
    passed,
    warnings,
    errors,
  };
}
