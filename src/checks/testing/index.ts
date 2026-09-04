import type { Check } from "../../types/check.js";
import type { RepositoryContext } from "../../types/context.js";
import { createResult } from "../helpers.js";

function hasUnitTestRunner(context: RepositoryContext): boolean {
  return context.testing.vitest.installed || context.testing.jest.installed;
}

export const testRunnerDetected: Check = {
  id: "testing/test-runner-detected",
  category: "testing",
  title: "A test runner is installed",
  weight: 3,
  applies: () => true,
  run: (context) => {
    if (!hasUnitTestRunner(context)) {
      return createResult(
        testRunnerDetected,
        "warning",
        "Neither Vitest nor Jest was found as a dependency.",
        "Add a test runner such as Vitest so the project's behavior can be verified automatically.",
      );
    }

    return createResult(testRunnerDetected, "pass");
  },
};

export const testScript: Check = {
  id: "testing/test-script",
  category: "testing",
  title: 'A "test" script is defined',
  weight: 2,
  applies: hasUnitTestRunner,
  run: (context) => {
    if (context.scripts.test === undefined) {
      return createResult(
        testScript,
        "warning",
        'No "test" script was found in package.json.',
        'Add a "test" script so `npm test` (and CI) can run the test suite.',
      );
    }

    return createResult(testScript, "pass");
  },
};

export const testFilesPresent: Check = {
  id: "testing/test-files-present",
  category: "testing",
  title: "Test files were found",
  weight: 3,
  applies: hasUnitTestRunner,
  run: (context) => {
    if (!context.testing.hasTestFiles) {
      return createResult(
        testFilesPresent,
        "warning",
        "A test runner is installed, but no *.test.* or *.spec.* files were found.",
        "Add test files, or remove the test runner dependency if it is unused.",
      );
    }

    return createResult(testFilesPresent, "pass");
  },
};

export const e2eTestsPresent: Check = {
  id: "testing/e2e-tests-present",
  category: "testing",
  title: "End-to-end tests were found",
  weight: 2,
  applies: (context) =>
    context.testing.playwright.installed || context.testing.cypress.installed,
  run: (context) => {
    if (!context.testing.hasE2eTestFiles) {
      return createResult(
        e2eTestsPresent,
        "warning",
        "An end-to-end testing tool is installed, but no e2e test files were found.",
        "Add end-to-end tests under e2e/ or cypress/, or remove the unused dependency.",
      );
    }

    return createResult(e2eTestsPresent, "pass");
  },
};

export const testingChecks: Check[] = [
  testRunnerDetected,
  testScript,
  testFilesPresent,
  e2eTestsPresent,
];
