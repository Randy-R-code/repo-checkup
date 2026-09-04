import { LOCKFILE_PACKAGE_MANAGERS } from "../../detectors/package-manager.js";
import type { Check } from "../../types/check.js";
import { createResult } from "../helpers.js";

export const packageJsonFound: Check = {
  id: "project/package-json-found",
  category: "project",
  title: "package.json is present and valid",
  weight: 5,
  applies: () => true,
  run: (context) => {
    if (context.packageJson === undefined) {
      return createResult(
        packageJsonFound,
        "error",
        "No readable package.json was found at the repository root.",
        "Add a package.json describing the project.",
      );
    }

    return createResult(packageJsonFound, "pass");
  },
};

export const packageManagerDetected: Check = {
  id: "project/package-manager-detected",
  category: "project",
  title: "Package manager is detected",
  weight: 2,
  applies: () => true,
  run: (context) => {
    if (context.packageManager === "unknown") {
      return createResult(
        packageManagerDetected,
        "warning",
        "No package manager could be detected from a packageManager field or a lockfile.",
        "Commit a lockfile and set the packageManager field so tooling and contributors use a consistent package manager.",
      );
    }

    return createResult(packageManagerDetected, "pass");
  },
};

export const conflictingLockfiles: Check = {
  id: "project/conflicting-lockfiles",
  category: "project",
  title: "No conflicting lockfiles",
  weight: 4,
  applies: () => true,
  run: (context) => {
    if (context.lockfiles.length > 1) {
      return createResult(
        conflictingLockfiles,
        "error",
        `Multiple lockfiles were found: ${context.lockfiles.join(", ")}.`,
        "Keep a single lockfile matching the project's package manager and remove the others.",
      );
    }

    return createResult(conflictingLockfiles, "pass");
  },
};

export const packageManagerFieldConsistency: Check = {
  id: "project/package-manager-field-consistency",
  category: "project",
  title: "packageManager field matches the lockfile",
  weight: 3,
  applies: (context) =>
    context.packageJson?.packageManager !== undefined &&
    context.lockfiles.length > 0,
  run: (context) => {
    const declaredName = context.packageJson?.packageManager?.split("@")[0];
    const impliedManagers = context.lockfiles.map(
      (lockfile) => LOCKFILE_PACKAGE_MANAGERS[lockfile],
    );

    if (
      declaredName !== undefined &&
      !impliedManagers.some((manager) => manager === declaredName)
    ) {
      return createResult(
        packageManagerFieldConsistency,
        "error",
        `The packageManager field declares "${declaredName}", but the committed lockfile(s) (${context.lockfiles.join(", ")}) suggest ${impliedManagers.join(", ")}.`,
        "Align the packageManager field with the lockfile actually committed to the repository.",
      );
    }

    return createResult(packageManagerFieldConsistency, "pass");
  },
};

export const projectChecks: Check[] = [
  packageJsonFound,
  packageManagerDetected,
  conflictingLockfiles,
  packageManagerFieldConsistency,
];
