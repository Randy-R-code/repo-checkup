import { stat } from "node:fs/promises";
import path from "node:path";
import { detectPackageManager } from "../detectors/package-manager.js";
import { detectProjectProfile } from "../detectors/profile.js";
import { detectRepositoryHygiene } from "../detectors/repository.js";
import { detectTesting } from "../detectors/testing.js";
import { detectTooling } from "../detectors/tooling.js";
import { readWorkflows } from "../parsers/github-actions.js";
import { readPackageJson } from "../parsers/package-json.js";
import { readTsConfig } from "../parsers/tsconfig.js";
import {
  LOCKFILES,
  type LockfileName,
  type RepositoryContext,
} from "../types/context.js";
import { fileExists } from "../utils/fs.js";

export async function buildRepositoryContext(
  targetPath: string,
): Promise<RepositoryContext> {
  const resolvedPath = path.resolve(targetPath);
  const stats = await stat(resolvedPath).catch(() => undefined);

  if (!stats?.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolvedPath}`);
  }

  const packageJson = await readPackageJson(resolvedPath);
  const lockfiles = await findLockfiles(resolvedPath);
  const dependencies = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };
  const hasTsconfig = await fileExists(
    path.join(resolvedPath, "tsconfig.json"),
  );
  const tsconfig = await readTsConfig(resolvedPath);
  const tooling = await detectTooling(resolvedPath, dependencies);
  const testing = await detectTesting(
    resolvedPath,
    dependencies,
    packageJson?.scripts ?? {},
  );
  const githubActionsWorkflows = await readWorkflows(resolvedPath);
  const repository = await detectRepositoryHygiene(resolvedPath);

  return {
    targetPath: resolvedPath,
    packageJson,
    scripts: packageJson?.scripts ?? {},
    dependencies,
    lockfiles,
    profile: detectProjectProfile(dependencies, packageJson),
    packageManager: detectPackageManager(
      packageJson?.packageManager,
      lockfiles,
    ),
    hasTsconfig,
    tsconfig,
    tooling,
    testing,
    githubActionsWorkflows,
    repository,
  };
}

async function findLockfiles(targetPath: string): Promise<LockfileName[]> {
  const found = await Promise.all(
    LOCKFILES.map(async (name) =>
      (await fileExists(path.join(targetPath, name))) ? name : undefined,
    ),
  );

  return found.filter((name): name is LockfileName => name !== undefined);
}
