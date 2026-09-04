import type { Check } from "../../types/check.js";
import type { RepositoryContext } from "../../types/context.js";
import { createResult } from "../helpers.js";

const PACKAGE_MANAGER_BINARIES = ["npm", "pnpm", "yarn", "bun"];

function isScriptInvokedInCi(
  context: RepositoryContext,
  scriptName: string,
): boolean {
  const patterns = PACKAGE_MANAGER_BINARIES.flatMap((pm) => [
    `${pm} run ${scriptName}`,
    `${pm} ${scriptName}`,
  ]);

  return context.githubActionsWorkflows.some((workflow) =>
    Object.values(workflow.jobs).some((job) =>
      job.steps.some(
        (step) =>
          step.run !== undefined &&
          patterns.some((pattern) => step.run?.includes(pattern)),
      ),
    ),
  );
}

function findScriptByContent(
  scripts: Record<string, string>,
  substring: string,
): string | undefined {
  return Object.entries(scripts).find(([, value]) =>
    value.includes(substring),
  )?.[0];
}

export const workflowsFound: Check = {
  id: "ci/workflows-found",
  category: "ci",
  title: "GitHub Actions workflows are present",
  weight: 3,
  applies: () => true,
  run: (context) => {
    if (context.githubActionsWorkflows.length === 0) {
      return createResult(
        workflowsFound,
        "warning",
        "No GitHub Actions workflow was found under .github/workflows.",
        "Add a workflow that installs dependencies and runs lint, typecheck, tests, and build.",
      );
    }

    return createResult(workflowsFound, "pass");
  },
};

export const pullRequestValidation: Check = {
  id: "ci/pull-request-validation",
  category: "ci",
  title: "A workflow validates pull requests",
  weight: 4,
  applies: (context) => context.githubActionsWorkflows.length > 0,
  run: (context) => {
    const hasPullRequestWorkflow = context.githubActionsWorkflows.some(
      (workflow) => workflow.triggersOnPullRequest,
    );

    if (!hasPullRequestWorkflow) {
      return createResult(
        pullRequestValidation,
        "warning",
        "No workflow triggers on pull_request.",
        "Add a pull_request trigger so changes are validated before merging.",
      );
    }

    return createResult(pullRequestValidation, "pass");
  },
};

export const testsInCi: Check = {
  id: "ci/tests-in-ci",
  category: "ci",
  title: "Tests run in CI",
  weight: 5,
  applies: (context) =>
    context.githubActionsWorkflows.length > 0 &&
    context.scripts.test !== undefined,
  run: (context) => {
    if (!isScriptInvokedInCi(context, "test")) {
      return createResult(
        testsInCi,
        "error",
        "A test script is configured, but no workflow step appears to run it.",
        "Run the test script in your GitHub Actions workflow so tests are enforced on every change.",
      );
    }

    return createResult(testsInCi, "pass");
  },
};

export const typecheckInCi: Check = {
  id: "ci/typecheck-in-ci",
  category: "ci",
  title: "Typechecking runs in CI",
  weight: 3,
  applies: (context) =>
    context.githubActionsWorkflows.length > 0 &&
    findScriptByContent(context.scripts, "tsc") !== undefined,
  run: (context) => {
    const script = findScriptByContent(context.scripts, "tsc");

    if (script !== undefined && !isScriptInvokedInCi(context, script)) {
      return createResult(
        typecheckInCi,
        "warning",
        "A typecheck script is configured, but no workflow step appears to run it.",
        "Run the typecheck script in CI so type errors are caught before merging.",
      );
    }

    return createResult(typecheckInCi, "pass");
  },
};

export const buildInCi: Check = {
  id: "ci/build-in-ci",
  category: "ci",
  title: "The project builds in CI",
  weight: 2,
  applies: (context) =>
    context.githubActionsWorkflows.length > 0 &&
    context.scripts.build !== undefined,
  run: (context) => {
    if (!isScriptInvokedInCi(context, "build")) {
      return createResult(
        buildInCi,
        "warning",
        "A build script is configured, but no workflow step appears to run it.",
        "Run the build script in CI to catch build failures before they reach users.",
      );
    }

    return createResult(buildInCi, "pass");
  },
};

export const ciChecks: Check[] = [
  workflowsFound,
  pullRequestValidation,
  testsInCi,
  typecheckInCi,
  buildInCi,
];
