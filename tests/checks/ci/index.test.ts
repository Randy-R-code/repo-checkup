import { describe, expect, it } from "vitest";
import {
  buildInCi,
  ciChecks,
  pullRequestValidation,
  testsInCi,
  typecheckInCi,
  workflowsFound,
} from "../../../src/checks/ci/index.js";
import type { Workflow } from "../../../src/parsers/github-actions.js";
import { createContext } from "../../helpers/context.js";

function createWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    fileName: "ci.yml",
    name: "CI",
    triggersOnPullRequest: false,
    jobs: {},
    ...overrides,
  };
}

describe("workflowsFound", () => {
  it("warns when there are no workflows", () => {
    expect(workflowsFound.run(createContext()).status).toBe("warning");
  });

  it("passes when a workflow exists", () => {
    const context = createContext({
      githubActionsWorkflows: [createWorkflow()],
    });

    expect(workflowsFound.run(context).status).toBe("pass");
  });
});

describe("pullRequestValidation", () => {
  it("does not apply without workflows", () => {
    expect(pullRequestValidation.applies(createContext())).toBe(false);
  });

  it("warns when no workflow triggers on pull_request", () => {
    const context = createContext({
      githubActionsWorkflows: [createWorkflow()],
    });

    expect(pullRequestValidation.run(context).status).toBe("warning");
  });

  it("passes when a workflow triggers on pull_request", () => {
    const context = createContext({
      githubActionsWorkflows: [createWorkflow({ triggersOnPullRequest: true })],
    });

    expect(pullRequestValidation.run(context).status).toBe("pass");
  });
});

describe("testsInCi", () => {
  it("does not apply without a test script", () => {
    const context = createContext({
      githubActionsWorkflows: [createWorkflow()],
    });

    expect(testsInCi.applies(context)).toBe(false);
  });

  it("errors when the test script is configured but not run in CI (the flagship cross-check)", () => {
    const context = createContext({
      scripts: { test: "vitest run" },
      githubActionsWorkflows: [
        createWorkflow({
          jobs: {
            build: { steps: [{ run: "pnpm install", uses: undefined }] },
          },
        }),
      ],
    });

    expect(testsInCi.applies(context)).toBe(true);
    expect(testsInCi.run(context).status).toBe("error");
  });

  it("passes when a step runs the test script", () => {
    const context = createContext({
      scripts: { test: "vitest run" },
      githubActionsWorkflows: [
        createWorkflow({
          jobs: {
            build: { steps: [{ run: "pnpm test", uses: undefined }] },
          },
        }),
      ],
    });

    expect(testsInCi.run(context).status).toBe("pass");
  });

  it("recognizes a bare package manager invocation without run", () => {
    const context = createContext({
      scripts: { test: "vitest run" },
      githubActionsWorkflows: [
        createWorkflow({
          jobs: {
            build: { steps: [{ run: "yarn test", uses: undefined }] },
          },
        }),
      ],
    });

    expect(testsInCi.run(context).status).toBe("pass");
  });
});

describe("typecheckInCi", () => {
  it("finds the script whose command contains tsc", () => {
    const context = createContext({
      scripts: { typecheck: "tsc --noEmit" },
      githubActionsWorkflows: [
        createWorkflow({
          jobs: {
            build: { steps: [{ run: "pnpm run typecheck", uses: undefined }] },
          },
        }),
      ],
    });

    expect(typecheckInCi.applies(context)).toBe(true);
    expect(typecheckInCi.run(context).status).toBe("pass");
  });

  it("warns when the typecheck script is not run in CI", () => {
    const context = createContext({
      scripts: { typecheck: "tsc --noEmit" },
      githubActionsWorkflows: [createWorkflow({ jobs: {} })],
    });

    expect(typecheckInCi.run(context).status).toBe("warning");
  });
});

describe("buildInCi", () => {
  it("warns when the build script is not run in CI", () => {
    const context = createContext({
      scripts: { build: "tsdown" },
      githubActionsWorkflows: [createWorkflow({ jobs: {} })],
    });

    expect(buildInCi.run(context).status).toBe("warning");
  });

  it("passes when the build script runs in CI", () => {
    const context = createContext({
      scripts: { build: "tsdown" },
      githubActionsWorkflows: [
        createWorkflow({
          jobs: {
            build: { steps: [{ run: "npm run build", uses: undefined }] },
          },
        }),
      ],
    });

    expect(buildInCi.run(context).status).toBe("pass");
  });
});

describe("ciChecks", () => {
  it("exposes every ci check", () => {
    expect(ciChecks).toHaveLength(5);
  });
});
