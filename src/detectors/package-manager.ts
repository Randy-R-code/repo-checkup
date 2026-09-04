import type { LockfileName } from "../types/context.js";
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from "../types/package-manager.js";

const LOCKFILE_PACKAGE_MANAGERS: Record<LockfileName, PackageManager> = {
  "pnpm-lock.yaml": "pnpm",
  "package-lock.json": "npm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "bun.lock": "bun",
};

const LOCKFILE_PRIORITY: LockfileName[] = [
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
  "package-lock.json",
];

export function detectPackageManager(
  packageManagerField: string | undefined,
  lockfiles: LockfileName[],
): PackageManager {
  const fromField = parsePackageManagerField(packageManagerField);
  if (fromField !== undefined) {
    return fromField;
  }

  for (const lockfile of LOCKFILE_PRIORITY) {
    if (lockfiles.includes(lockfile)) {
      return LOCKFILE_PACKAGE_MANAGERS[lockfile];
    }
  }

  return "unknown";
}

function parsePackageManagerField(
  value: string | undefined,
): PackageManager | undefined {
  if (value === undefined) {
    return undefined;
  }

  const name = value.split("@")[0];

  return PACKAGE_MANAGERS.find((manager) => manager === name);
}
