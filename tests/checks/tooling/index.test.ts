import { describe, expect, it } from "vitest";
import {
  biomeConsistency,
  eslintConsistency,
  overlappingLinters,
  prettierConsistency,
  toolingChecks,
} from "../../../src/checks/tooling/index.js";
import { createContext } from "../../helpers/context.js";

describe("eslintConsistency", () => {
  it("does not apply when ESLint has no evidence", () => {
    expect(eslintConsistency.applies(createContext())).toBe(false);
  });

  it("warns when installed without a config file", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: true, configured: false },
        biome: { installed: false, configured: false },
        prettier: { installed: false, configured: false },
      },
    });

    expect(eslintConsistency.run(context).status).toBe("warning");
  });

  it("errors when configured without being installed", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: false, configured: true },
        biome: { installed: false, configured: false },
        prettier: { installed: false, configured: false },
      },
    });

    expect(eslintConsistency.run(context).status).toBe("error");
  });

  it("passes when installed and configured", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: true, configured: true },
        biome: { installed: false, configured: false },
        prettier: { installed: false, configured: false },
      },
    });

    expect(eslintConsistency.run(context).status).toBe("pass");
  });
});

describe("biomeConsistency and prettierConsistency", () => {
  it("apply independently of eslint", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: false, configured: false },
        biome: { installed: true, configured: true },
        prettier: { installed: true, configured: true },
      },
    });

    expect(biomeConsistency.applies(context)).toBe(true);
    expect(biomeConsistency.run(context).status).toBe("pass");
    expect(prettierConsistency.applies(context)).toBe(true);
    expect(prettierConsistency.run(context).status).toBe("pass");
  });
});

describe("overlappingLinters", () => {
  const bothPresent = {
    eslint: { installed: true, configured: true },
    biome: { installed: true, configured: true },
    prettier: { installed: false, configured: false },
  };

  it("passes when only Biome is set up", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: false, configured: false },
        biome: { installed: true, configured: true },
        prettier: { installed: false, configured: false },
      },
    });

    expect(overlappingLinters.run(context).status).toBe("pass");
  });

  it("passes when only ESLint is set up", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: true, configured: true },
        biome: { installed: false, configured: false },
        prettier: { installed: false, configured: false },
      },
    });

    expect(overlappingLinters.run(context).status).toBe("pass");
  });

  it("passes when ESLint lints and Biome only formats (legitimate split)", () => {
    const context = createContext({
      tooling: bothPresent,
      scripts: {
        lint: "eslint .",
        format: "biome format --write .",
      },
    });

    expect(overlappingLinters.run(context).status).toBe("pass");
  });

  it("warns when ESLint and Biome both lint", () => {
    const context = createContext({
      tooling: bothPresent,
      scripts: {
        lint: "eslint . && biome lint .",
      },
    });

    expect(overlappingLinters.run(context).status).toBe("warning");
  });

  it("warns when Biome's check command overlaps with ESLint linting", () => {
    const context = createContext({
      tooling: bothPresent,
      scripts: {
        lint: "eslint .",
        check: "biome check .",
      },
    });

    expect(overlappingLinters.run(context).status).toBe("warning");
  });

  it("passes when both are installed but there is no script evidence of overlap", () => {
    const context = createContext({ tooling: bothPresent });

    expect(overlappingLinters.run(context).status).toBe("pass");
  });
});

describe("toolingChecks", () => {
  it("exposes every tooling check", () => {
    expect(toolingChecks).toHaveLength(4);
  });
});
