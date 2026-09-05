#!/usr/bin/env node
import cac from "cac";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { analyze } from "./core/analyzer.js";
import { createJsonReport } from "./reporters/json.js";
import { renderTerminalReport } from "./reporters/terminal.js";
import { CATEGORIES, type Category } from "./types/category.js";

// package.json sits one directory above this file both in source
// (src/cli.ts) and in the tsdown bundle (dist/cli.js), and npm always
// includes package.json in the published tarball even though "files"
// only lists "dist" — so this relative lookup resolves in dev, in the
// build, and once installed from npm.
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

export function getCliMeta() {
  return {
    name: "RepoCheckup",
    version: packageJson.version,
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

// A plain string/URL comparison breaks whenever the entry point is reached
// through a symlink (e.g. npm's node_modules/.bin/repo-checkup) or an
// OS-normalized path (e.g. macOS resolving /tmp to /private/tmp):
// import.meta.url follows those to the real file, argv[1] does not.
// realpathSync on both sides makes the comparison symlink-safe.
export function isMainModule(
  moduleUrl: string,
  argv1: string | undefined,
): boolean {
  if (argv1 === undefined) {
    return false;
  }

  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argv1);
  } catch {
    return false;
  }
}

if (isMainModule(import.meta.url, process.argv[1])) {
  run();
}
