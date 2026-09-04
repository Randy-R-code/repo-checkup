import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readWorkflows } from "../../src/parsers/github-actions.js";

async function createWorkflow(content: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-workflows-"));
  const workflowsDir = path.join(dir, ".github", "workflows");
  await mkdir(workflowsDir, { recursive: true });
  await writeFile(path.join(workflowsDir, "ci.yml"), content, "utf8");

  return dir;
}

describe("readWorkflows", () => {
  it("returns an empty array when there is no workflows directory", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "repo-checkup-"));

    expect(await readWorkflows(dir)).toEqual([]);
  });

  it("parses name, pull_request trigger, and steps", async () => {
    const dir = await createWorkflow(`
name: CI
on:
  push:
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm test
`);

    const [workflow] = await readWorkflows(dir);

    expect(workflow?.name).toBe("CI");
    expect(workflow?.triggersOnPullRequest).toBe(true);
    expect(workflow?.jobs.build?.steps).toEqual([
      { run: undefined, uses: "actions/checkout@v4" },
      { run: "pnpm install", uses: undefined },
      { run: "pnpm test", uses: undefined },
    ]);
  });

  it("does not treat the bare 'on' key as a boolean (YAML 1.2)", async () => {
    const dir = await createWorkflow(`
on: push
jobs: {}
`);

    const [workflow] = await readWorkflows(dir);

    expect(workflow?.triggersOnPullRequest).toBe(false);
  });

  it("detects a pull_request trigger given as a plain string", async () => {
    const dir = await createWorkflow(`
on: pull_request
jobs: {}
`);

    const [workflow] = await readWorkflows(dir);

    expect(workflow?.triggersOnPullRequest).toBe(true);
  });

  it("skips a workflow file that fails to parse", async () => {
    const dir = await createWorkflow("not: [valid: yaml");

    expect(await readWorkflows(dir)).toEqual([]);
  });
});
