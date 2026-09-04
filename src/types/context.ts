import type { Workflow } from "../parsers/github-actions.js";
import type { PackageJson } from "../parsers/package-json.js";
import type { TsConfig } from "../parsers/tsconfig.js";
import type { PackageManager } from "./package-manager.js";
import type { ProjectProfile } from "./profile.js";
import type { TestingEvidence } from "./testing.js";
import type { ToolingEvidence } from "./tooling.js";

export const LOCKFILES = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
] as const;

export type LockfileName = (typeof LOCKFILES)[number];

export interface RepositoryContext {
  targetPath: string;
  packageJson: PackageJson | undefined;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  lockfiles: LockfileName[];
  profile: ProjectProfile;
  packageManager: PackageManager;
  hasTsconfig: boolean;
  tsconfig: TsConfig | undefined;
  tooling: ToolingEvidence;
  testing: TestingEvidence;
  githubActionsWorkflows: Workflow[];
}
