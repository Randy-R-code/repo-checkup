import { describe, expect, it } from "vitest";
import { runChecks } from "../../src/core/registry.js";
import type { Check } from "../../src/types/check.js";
import type { RepositoryContext } from "../../src/types/context.js";

function createContext(): RepositoryContext {
  return {
    targetPath: "/repo",
    packageJson: undefined,
    scripts: {},
    dependencies: {},
    lockfiles: [],
    profile: "generic",
    packageManager: "unknown",
  };
}

describe("runChecks", () => {
  it("only runs checks whose applies() returns true", () => {
    const applicable: Check = {
      id: "a",
      category: "project",
      title: "A",
      weight: 1,
      applies: () => true,
      run: () => ({
        id: "a",
        category: "project",
        status: "pass",
        title: "A",
        message: undefined,
        recommendation: undefined,
      }),
    };

    const notApplicable: Check = {
      id: "b",
      category: "project",
      title: "B",
      weight: 1,
      applies: () => false,
      run: () => {
        throw new Error("should not run");
      },
    };

    const results = runChecks([applicable, notApplicable], createContext());

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("a");
  });
});
