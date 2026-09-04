import pc from "picocolors";
import type { AnalysisResult } from "../core/analyzer.js";
import { detectDetectedTools } from "../detectors/detected-tools.js";
import { CATEGORIES, type Category } from "../types/category.js";
import type { CheckResult } from "../types/check.js";
import type { ProjectProfile } from "../types/profile.js";

const PROFILE_LABELS: Record<ProjectProfile, string> = {
  nextjs: "Next.js",
  "vite-react": "Vite + React",
  "tanstack-start": "TanStack Start",
  "node-backend": "Node.js backend",
  "node-cli": "Node.js CLI",
  "npm-library": "npm library",
  generic: "Generic",
};

const CATEGORY_LABELS: Record<Category, string> = {
  project: "Project",
  typescript: "TypeScript",
  tooling: "Tooling",
  testing: "Testing",
  ci: "CI",
  repository: "Repository",
};

const TOOL_LABELS: Record<string, string> = {
  vitest: "Vitest",
  jest: "Jest",
  playwright: "Playwright",
  cypress: "Cypress",
  eslint: "ESLint",
  biome: "Biome",
  prettier: "Prettier",
  "github-actions": "GitHub Actions",
};

export function renderTerminalReport(analysis: AnalysisResult): string {
  const { context, results, summary } = analysis;
  const lines: string[] = [];

  lines.push(pc.bold("RepoCheckup"));
  lines.push("");
  lines.push(`Checking ${context.targetPath}...`);
  lines.push("");

  lines.push("Detected");
  lines.push(renderDetectedLine(analysis));
  lines.push("");

  lines.push(...renderCategoryCounts(results));
  lines.push("");

  const issues = results.filter(
    (result) => result.status === "warning" || result.status === "error",
  );

  if (issues.length > 0) {
    lines.push("Issues");
    lines.push("");
    for (const issue of issues) {
      lines.push(...renderIssue(issue));
    }
  }

  lines.push("Summary");
  lines.push(
    `${pc.green("✓")} ${summary.passed} passed  ${pc.yellow("!")} ${summary.warnings} recommendations  ${pc.red("✗")} ${summary.errors} issues`,
  );
  lines.push("");
  lines.push(`Health ${summary.score}/100`);

  return lines.join("\n");
}

function renderDetectedLine(analysis: AnalysisResult): string {
  const { context } = analysis;
  const isTypeScript =
    context.hasTsconfig || context.dependencies.typescript !== undefined;

  const parts = [
    PROFILE_LABELS[context.profile],
    isTypeScript ? "TypeScript" : "JavaScript",
    context.packageManager === "unknown" ? undefined : context.packageManager,
    ...detectDetectedTools(context).map((tool) => TOOL_LABELS[tool] ?? tool),
  ].filter((part): part is string => part !== undefined);

  return parts.join(" · ");
}

function renderCategoryCounts(results: CheckResult[]): string[] {
  const lines: string[] = [];

  for (const category of CATEGORIES) {
    const inCategory = results.filter(
      (result) => result.category === category && result.status !== "skipped",
    );

    if (inCategory.length === 0) {
      continue;
    }

    const passed = inCategory.filter(
      (result) => result.status === "pass",
    ).length;

    lines.push(
      `${CATEGORY_LABELS[category].padEnd(14)} ${passed}/${inCategory.length}`,
    );
  }

  return lines;
}

function renderIssue(issue: CheckResult): string[] {
  const symbol = issue.status === "error" ? pc.red("✗") : pc.yellow("!");
  const lines = [`${symbol} ${issue.title}`];

  if (issue.message !== undefined) {
    lines.push(`  ${issue.message}`);
  }

  if (issue.recommendation !== undefined) {
    lines.push("");
    lines.push("  Recommendation:");
    lines.push(`  ${issue.recommendation}`);
  }

  lines.push("");

  return lines;
}
