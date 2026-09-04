import path from "node:path";
import { parse as parseYaml } from "yaml";
import { safeReaddir, safeReadFile } from "../utils/safe-read.js";

export interface WorkflowStep {
  run: string | undefined;
  uses: string | undefined;
}

export interface WorkflowJob {
  steps: WorkflowStep[];
}

export interface Workflow {
  fileName: string;
  name: string | undefined;
  triggersOnPullRequest: boolean;
  jobs: Record<string, WorkflowJob>;
}

export async function readWorkflows(targetPath: string): Promise<Workflow[]> {
  const workflowsDir = path.join(targetPath, ".github", "workflows");
  const entries = await safeReaddir(targetPath, workflowsDir);
  const fileNames = entries.filter((entry) => /\.ya?ml$/.test(entry));

  const workflows = await Promise.all(
    fileNames.map((fileName) =>
      readWorkflow(targetPath, workflowsDir, fileName),
    ),
  );

  return workflows.filter(
    (workflow): workflow is Workflow => workflow !== undefined,
  );
}

async function readWorkflow(
  targetPath: string,
  workflowsDir: string,
  fileName: string,
): Promise<Workflow | undefined> {
  const raw = await safeReadFile(targetPath, path.join(workflowsDir, fileName));

  if (raw === undefined) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed)) {
    return undefined;
  }

  return {
    fileName,
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    triggersOnPullRequest: triggersOnPullRequest(parsed.on),
    jobs: parseJobs(parsed.jobs),
  };
}

function triggersOnPullRequest(on: unknown): boolean {
  if (typeof on === "string") {
    return on === "pull_request";
  }

  if (Array.isArray(on)) {
    return on.includes("pull_request");
  }

  return isRecord(on) && "pull_request" in on;
}

function parseJobs(jobs: unknown): Record<string, WorkflowJob> {
  if (!isRecord(jobs)) {
    return {};
  }

  const result: Record<string, WorkflowJob> = {};

  for (const [jobId, job] of Object.entries(jobs)) {
    result[jobId] = {
      steps: parseSteps(isRecord(job) ? job.steps : undefined),
    };
  }

  return result;
}

function parseSteps(steps: unknown): WorkflowStep[] {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.filter(isRecord).map((step) => ({
    run: typeof step.run === "string" ? step.run : undefined,
    uses: typeof step.uses === "string" ? step.uses : undefined,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
