import { describe, expect, it } from "vitest";
import { detectDetectedTools } from "../../src/detectors/detected-tools.js";
import { createContext } from "../helpers/context.js";

describe("detectDetectedTools", () => {
  it("returns an empty list when nothing was detected", () => {
    expect(detectDetectedTools(createContext())).toEqual([]);
  });

  it("lists detected testing, tooling, and CI evidence", () => {
    const context = createContext({
      testing: {
        vitest: { installed: true },
        jest: { installed: false },
        playwright: { installed: true },
        cypress: { installed: false },
        hasTestFiles: true,
        hasE2eTestFiles: false,
      },
      tooling: {
        eslint: { installed: false, configured: false },
        biome: { installed: true, configured: true },
        prettier: { installed: false, configured: false },
      },
      githubActionsWorkflows: [
        {
          fileName: "ci.yml",
          name: "CI",
          triggersOnPullRequest: true,
          jobs: {},
        },
      ],
    });

    expect(detectDetectedTools(context)).toEqual([
      "vitest",
      "playwright",
      "biome",
      "github-actions",
    ]);
  });
});
