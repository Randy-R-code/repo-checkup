import { describe, expect, it } from "vitest";
import type { AnalysisResult } from "../../src/core/analyzer.js";
import { createJsonReport } from "../../src/reporters/json.js";
import type { CheckResult } from "../../src/types/check.js";
import { createContext } from "../helpers/context.js";

function createAnalysis(
  overrides: Partial<AnalysisResult> = {},
): AnalysisResult {
  return {
    context: createContext(),
    results: [],
    summary: { score: 100, passed: 0, warnings: 0, errors: 0 },
    ...overrides,
  };
}

describe("createJsonReport", () => {
  it("reports javascript when no TypeScript evidence is present", () => {
    const report = createJsonReport(createAnalysis(), "0.1.0");

    expect(report.version).toBe("0.1.0");
    expect(report.context.language).toBe("javascript");
    expect(report.context.profile).toBe("generic");
    expect(report.context.packageManager).toBe("unknown");
  });

  it("reports typescript when a tsconfig is present", () => {
    const report = createJsonReport(
      createAnalysis({ context: createContext({ hasTsconfig: true }) }),
      "0.1.0",
    );

    expect(report.context.language).toBe("typescript");
  });

  it("maps check results into a plain, serializable shape", () => {
    const result: CheckResult = {
      id: "ci/tests-in-ci",
      category: "ci",
      status: "error",
      title: "Tests run in CI",
      weight: 5,
      message: "no step runs tests",
      recommendation: "run the test script",
    };

    const report = createJsonReport(
      createAnalysis({ results: [result] }),
      "0.1.0",
    );

    expect(report.results).toEqual([
      {
        id: "ci/tests-in-ci",
        category: "ci",
        status: "error",
        title: "Tests run in CI",
        message: "no step runs tests",
        recommendation: "run the test script",
      },
    ]);
  });

  it("produces output that round-trips through JSON.stringify", () => {
    const report = createJsonReport(createAnalysis(), "0.1.0");
    const parsed = JSON.parse(JSON.stringify(report));

    expect(parsed).toEqual(report);
  });
});
