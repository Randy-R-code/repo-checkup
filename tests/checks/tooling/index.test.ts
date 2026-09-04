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

  it("warns when both ESLint and Biome are set up", () => {
    const context = createContext({
      tooling: {
        eslint: { installed: true, configured: true },
        biome: { installed: true, configured: true },
        prettier: { installed: false, configured: false },
      },
    });

    expect(overlappingLinters.run(context).status).toBe("warning");
  });
});

describe("toolingChecks", () => {
  it("exposes every tooling check", () => {
    expect(toolingChecks).toHaveLength(4);
  });
});
