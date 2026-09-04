import { describe, expect, it } from "vitest";
import {
  conflictingLockfiles,
  packageJsonFound,
  packageManagerDetected,
  packageManagerFieldConsistency,
  projectChecks,
} from "../../../src/checks/project/index.js";
import { createContext } from "../../helpers/context.js";
import { createPackageJson } from "../../helpers/package-json.js";

describe("packageJsonFound", () => {
  it("passes when package.json was read", () => {
    const result = packageJsonFound.run(
      createContext({ packageJson: createPackageJson({ name: "x" }) }),
    );

    expect(result.status).toBe("pass");
  });

  it("errors when package.json is missing", () => {
    const result = packageJsonFound.run(createContext());

    expect(result.status).toBe("error");
  });
});

describe("packageManagerDetected", () => {
  it("warns when the package manager is unknown", () => {
    const result = packageManagerDetected.run(createContext());

    expect(result.status).toBe("warning");
  });

  it("passes when a package manager was detected", () => {
    const result = packageManagerDetected.run(
      createContext({ packageManager: "pnpm" }),
    );

    expect(result.status).toBe("pass");
  });
});

describe("conflictingLockfiles", () => {
  it("passes with a single lockfile", () => {
    const result = conflictingLockfiles.run(
      createContext({ lockfiles: ["pnpm-lock.yaml"] }),
    );

    expect(result.status).toBe("pass");
  });

  it("errors with more than one lockfile", () => {
    const result = conflictingLockfiles.run(
      createContext({ lockfiles: ["pnpm-lock.yaml", "yarn.lock"] }),
    );

    expect(result.status).toBe("error");
  });
});

describe("packageManagerFieldConsistency", () => {
  it("does not apply without a packageManager field", () => {
    expect(
      packageManagerFieldConsistency.applies(
        createContext({ lockfiles: ["pnpm-lock.yaml"] }),
      ),
    ).toBe(false);
  });

  it("does not apply without any lockfile", () => {
    expect(
      packageManagerFieldConsistency.applies(
        createContext({
          packageJson: createPackageJson({ packageManager: "pnpm@10.0.0" }),
        }),
      ),
    ).toBe(false);
  });

  it("passes when the field matches the lockfile", () => {
    const context = createContext({
      packageJson: createPackageJson({ packageManager: "pnpm@10.0.0" }),
      lockfiles: ["pnpm-lock.yaml"],
    });

    expect(packageManagerFieldConsistency.applies(context)).toBe(true);
    expect(packageManagerFieldConsistency.run(context).status).toBe("pass");
  });

  it("errors when the field does not match the lockfile", () => {
    const context = createContext({
      packageJson: createPackageJson({ packageManager: "pnpm@10.0.0" }),
      lockfiles: ["yarn.lock"],
    });

    expect(packageManagerFieldConsistency.run(context).status).toBe("error");
  });

  it("sanitizes an attacker-controlled packageManager value in the message (regression)", () => {
    const esc = String.fromCharCode(27);
    const malicious = `pnpm${esc}[31mFAKE${esc}[0m`;
    const context = createContext({
      packageJson: createPackageJson({
        packageManager: `${malicious}@10.0.0`,
      }),
      lockfiles: ["yarn.lock"],
    });

    const result = packageManagerFieldConsistency.run(context);

    expect(result.message).not.toContain(esc);
    expect(result.message).toContain("pnpm [31mFAKE [0m");
  });
});

describe("projectChecks", () => {
  it("exposes every project check", () => {
    expect(projectChecks).toHaveLength(4);
  });
});
