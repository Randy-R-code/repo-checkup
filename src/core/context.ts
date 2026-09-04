import { stat } from "node:fs/promises";
import path from "node:path";
import { detectProjectProfile } from "../detectors/profile.js";
import { readPackageJson } from "../parsers/package-json.js";
import {
  LOCKFILES,
  type LockfileName,
  type RepositoryContext,
} from "../types/context.js";

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

  return {
    targetPath: resolvedPath,
    packageJson,
    scripts: packageJson?.scripts ?? {},
    dependencies,
    lockfiles,
    profile: detectProjectProfile(dependencies, packageJson),
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
