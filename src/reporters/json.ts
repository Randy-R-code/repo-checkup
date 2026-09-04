import type { AnalysisResult } from "../core/analyzer.js";
import { detectDetectedTools } from "../detectors/detected-tools.js";

export interface JsonReport {
  version: string;
  target: string;
  context: {
    profile: string;
    language: "typescript" | "javascript";
    packageManager: string;
    tools: string[];
  };
  summary: {
    score: number;
    passed: number;
    warnings: number;
    errors: number;
  };
  results: Array<{
    id: string;
    category: string;
    status: string;
    title: string;
    message: string | undefined;
    recommendation: string | undefined;
  }>;
}

export function createJsonReport(
  analysis: AnalysisResult,
  version: string,
): JsonReport {
  const { context, results, summary } = analysis;
  const isTypeScript =
    context.hasTsconfig || context.dependencies.typescript !== undefined;

  return {
    version,
    target: context.targetPath,
    context: {
      profile: context.profile,
      language: isTypeScript ? "typescript" : "javascript",
      packageManager: context.packageManager,
      tools: detectDetectedTools(context),
    },
    summary,
    results: results.map((result) => ({
      id: result.id,
      category: result.category,
      status: result.status,
      title: result.title,
      message: result.message,
      recommendation: result.recommendation,
    })),
  };
}
