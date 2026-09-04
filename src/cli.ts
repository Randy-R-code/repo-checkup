#!/usr/bin/env node
import cac from "cac";
import pc from "picocolors";

export function getCliMeta() {
  return {
    name: "RepoCheckup",
    version: "0.1.0",
    tagline: "Give your JavaScript or TypeScript repository a quick checkup.",
  };
}

function run() {
  const meta = getCliMeta();
  const cli = cac("repo-checkup");

  cli.version(meta.version);
  cli.help();
  cli.parse();

  if (cli.options.help || cli.options.version) {
    return;
  }

  console.log(pc.bold(meta.name));
  console.log(meta.tagline);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
