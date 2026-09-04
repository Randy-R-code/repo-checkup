import type { PackageJson } from "../parsers/package-json.js";

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
}
