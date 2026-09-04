#!/usr/bin/env node
import cac from "cac";
import { analyze } from "./core/analyzer.js";
import { createJsonReport } from "./reporters/json.js";
import { renderTerminalReport } from "./reporters/terminal.js";
import { CATEGORIES, type Category } from "./types/category.js";

export function getCliMeta() {
  return {
    name: "RepoCheckup",
    version: "0.1.0",
    tagline: "Give your JavaScript or TypeScript repository a quick checkup.",
  };
}

interface CliOptions {
  json?: boolean;
  ci?: boolean;
  category?: string;
  verbose?: boolean;
  score?: boolean;
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

async function runScan(targetPath: string, options: CliOptions) {
  const meta = getCliMeta();

  if (options.category !== undefined && !isCategory(options.category)) {
    console.error(
      `Unknown category "${options.category}". Valid categories: ${CATEGORIES.join(", ")}.`,
    );
    process.exitCode = 2;
    return;
  }

  let analysis: Awaited<ReturnType<typeof analyze>>;
  try {
    analysis = await analyze(targetPath, { category: options.category });
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : "Failed to analyze the repository.",
    );
    process.exitCode = 2;
    return;
  }

  if (options.json) {
    console.log(
      JSON.stringify(createJsonReport(analysis, meta.version), null, 2),
    );
  } else {
    console.log(
      renderTerminalReport(analysis, {
        verbose: options.verbose,
        showScore: options.score,
      }),
    );
  }

  if (options.ci && analysis.summary.errors > 0) {
    process.exitCode = 1;
  }
}

function run() {
  const meta = getCliMeta();
  const cli = cac("repo-checkup");

  cli
    .command("[path]", "Check a JavaScript/TypeScript repository")
    .option("--json", "Output the report as JSON")
    .option(
      "--ci",
      "Use a deterministic exit code (1) when any check reports an error",
    )
    .option(
      "--category <category>",
      `Only run one category (${CATEGORIES.join(", ")})`,
    )
    .option("--verbose", "List every check result, not just issues")
    .option("--no-score", "Hide the health score from the terminal report")
    .action((path: string | undefined, options: CliOptions) =>
      runScan(path ?? ".", options),
    );

  cli.version(meta.version);
  cli.help();
  cli.parse();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
