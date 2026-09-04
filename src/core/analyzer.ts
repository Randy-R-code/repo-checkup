import { ciChecks } from "../checks/ci/index.js";
import { projectChecks } from "../checks/project/index.js";
import { repositoryChecks } from "../checks/repository/index.js";
import { testingChecks } from "../checks/testing/index.js";
import { toolingChecks } from "../checks/tooling/index.js";
import { typescriptChecks } from "../checks/typescript/index.js";
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

export async function analyze(targetPath: string): Promise<AnalysisResult> {
  const context = await buildRepositoryContext(targetPath);
  const results = runChecks(ALL_CHECKS, context);
  const summary = computeScore(results);

  return { context, results, summary };
}
