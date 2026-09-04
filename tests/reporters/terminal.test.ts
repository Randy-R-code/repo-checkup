import { describe, expect, it } from "vitest";
import type { AnalysisResult } from "../../src/core/analyzer.js";
import { renderTerminalReport } from "../../src/reporters/terminal.js";
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

describe("renderTerminalReport", () => {
  it("includes the product name, target path, and health score", () => {
    const output = renderTerminalReport(
      createAnalysis({
        context: createContext({ targetPath: "/projects/example" }),
        summary: { score: 86, passed: 33, warnings: 3, errors: 2 },
      }),
    );

    expect(output).toContain("RepoCheckup");
    expect(output).toContain("Checking /projects/example...");
    expect(output).toContain("Health 86/100");
    expect(output).toContain("33 passed");
  });

  it("lists a human-readable Detected line from the profile and tools", () => {
    const output = renderTerminalReport(
      createAnalysis({
        context: createContext({
          profile: "nextjs",
          packageManager: "pnpm",
          hasTsconfig: true,
          testing: {
            vitest: { installed: true },
            jest: { installed: false },
            playwright: { installed: false },
            cypress: { installed: false },
            hasTestFiles: true,
            hasE2eTestFiles: false,
          },
        }),
      }),
    );

    expect(output).toContain("Detected\nNext.js · TypeScript · pnpm · Vitest");
  });

  it("renders an issue's title, message, and recommendation", () => {
    const issue: CheckResult = {
      id: "ci/tests-in-ci",
      category: "ci",
      status: "error",
      title: "Tests are not executed on pull requests",
      weight: 5,
      message: "No pull-request workflow runs the test suite.",
      recommendation: "Run your test script in the pull-request workflow.",
    };

    const output = renderTerminalReport(createAnalysis({ results: [issue] }));

    expect(output).toContain("Issues");
    expect(output).toContain("Tests are not executed on pull requests");
    expect(output).toContain("No pull-request workflow runs the test suite.");
    expect(output).toContain("Recommendation:");
    expect(output).toContain(
      "Run your test script in the pull-request workflow.",
    );
  });

  it("omits the Issues section when there are no warnings or errors", () => {
    const pass: CheckResult = {
      id: "project/package-json-found",
      category: "project",
      status: "pass",
      title: "package.json is present and valid",
      weight: 5,
      message: undefined,
      recommendation: undefined,
    };

    const output = renderTerminalReport(createAnalysis({ results: [pass] }));

    expect(output).not.toContain("Issues");
  });

  it("lists every result under verbose, including passes", () => {
    const pass: CheckResult = {
      id: "project/package-json-found",
      category: "project",
      status: "pass",
      title: "package.json is present and valid",
      weight: 5,
      message: undefined,
      recommendation: undefined,
    };

    const output = renderTerminalReport(createAnalysis({ results: [pass] }), {
      verbose: true,
      showScore: undefined,
    });

    expect(output).toContain("All checks");
    expect(output).toContain("package.json is present and valid");
  });

  it("hides the health score when showScore is false", () => {
    const output = renderTerminalReport(createAnalysis(), {
      verbose: undefined,
      showScore: false,
    });

    expect(output).not.toContain("Health");
  });
});
