#!/usr/bin/env node
import cac from "cac";
import { analyze } from "./core/analyzer.js";
import { createJsonReport } from "./reporters/json.js";
import { renderTerminalReport } from "./reporters/terminal.js";

export function getCliMeta() {
  return {
    name: "RepoCheckup",
    version: "0.1.0",
    tagline: "Give your JavaScript or TypeScript repository a quick checkup.",
  };
}

interface CliOptions {
  json?: boolean;
}

async function runScan(targetPath: string, options: CliOptions) {
  const meta = getCliMeta();

  let analysis: Awaited<ReturnType<typeof analyze>>;
  try {
    analysis = await analyze(targetPath);
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
    return;
  }

  console.log(renderTerminalReport(analysis));
}

function run() {
  const meta = getCliMeta();
  const cli = cac("repo-checkup");

  cli
    .command("[path]", "Check a JavaScript/TypeScript repository")
    .option("--json", "Output the report as JSON")
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
