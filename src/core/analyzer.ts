import { ciChecks } from "../checks/ci/index.js";
import { projectChecks } from "../checks/project/index.js";
import { repositoryChecks } from "../checks/repository/index.js";
import { testingChecks } from "../checks/testing/index.js";
import { toolingChecks } from "../checks/tooling/index.js";
import { typescriptChecks } from "../checks/typescript/index.js";
import type { Category } from "../types/category.js";
import type { Check, CheckResult } from "../types/check.js";
import type { RepositoryContext } from "../types/context.js";
import { buildRepositoryContext } from "./context.js";
import { runChecks } from "./registry.js";
import { computeScore, type ScoreSummary } from "./score.js";

const ALL_CHECKS: Check[] = [
  ...projectChecks,
  ...typescriptChecks,
  ...toolingChecks,
  ...testingChecks,
  ...ciChecks,
  ...repositoryChecks,
];

export interface AnalysisResult {
  context: RepositoryContext;
  results: CheckResult[];
  summary: ScoreSummary;
}

export interface AnalyzeOptions {
  category: Category | undefined;
}

export async function analyze(
  targetPath: string,
  options: AnalyzeOptions = { category: undefined },
): Promise<AnalysisResult> {
  const context = await buildRepositoryContext(targetPath);
  const checks =
    options.category === undefined
      ? ALL_CHECKS
      : ALL_CHECKS.filter((check) => check.category === options.category);
  const results = runChecks(checks, context);
  const summary = computeScore(results);

  return { context, results, summary };
}
