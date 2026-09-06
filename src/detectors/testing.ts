import { glob } from "tinyglobby";
import type { TestingEvidence } from "../types/testing.js";

const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.git/**",
  "**/.next/**",
  "**/.cache/**",
  "**/.turbo/**",
  "**/.output/**",
];

const TEST_FILE_PATTERNS = [
  "**/*.{test,spec}.{js,jsx,ts,tsx}",
  // AVA, Mocha, and Node's own test runner conventionally place plain
  // (unsuffixed) test files under a test/tests/__tests__ directory instead
  // of naming each file *.test.*.
  "test/**/*.{js,jsx,ts,tsx}",
  "tests/**/*.{js,jsx,ts,tsx}",
  "__tests__/**/*.{js,jsx,ts,tsx}",
];

const E2E_FILE_PATTERNS = [
  "e2e/**/*.{js,jsx,ts,tsx}",
  "tests/e2e/**/*.{js,jsx,ts,tsx}",
  "cypress/**/*.cy.{js,jsx,ts,tsx}",
  "cypress/e2e/**/*.{js,jsx,ts,tsx}",
];

// Bounds traversal against a pathologically deep directory tree; well
// beyond any realistic (even monorepo) source layout.
const MAX_TRAVERSAL_DEPTH = 30;

const SHELL_COMMAND_SEPARATOR = /&&|\|\||[;|]/;

/**
 * Detects Node's built-in test runner (`node --test`) as a script command.
 * Node ships this runner, so unlike Vitest/Jest/AVA/Mocha it never appears
 * as a dependency. Kept conservative: only a script whose first token is
 * literally `node` and which passes `--test` as its own argument counts,
 * so an unrelated `node server.js` or a `--test-reporter=...` flag alone
 * doesn't.
 */
function usesNodeTestRunner(scripts: Record<string, string>): boolean {
  return Object.values(scripts).some((script) =>
    script.split(SHELL_COMMAND_SEPARATOR).some((segment) => {
      const tokens = segment.trim().split(/\s+/);
      return tokens[0] === "node" && tokens.includes("--test");
    }),
  );
}

export async function detectTesting(
  targetPath: string,
  dependencies: Record<string, string>,
  scripts: Record<string, string> = {},
): Promise<TestingEvidence> {
  const [testFiles, e2eFiles] = await Promise.all([
    glob(TEST_FILE_PATTERNS, {
      cwd: targetPath,
      ignore: IGNORE,
      onlyFiles: true,
      followSymbolicLinks: false,
      deep: MAX_TRAVERSAL_DEPTH,
    }),
    glob(E2E_FILE_PATTERNS, {
      cwd: targetPath,
      ignore: IGNORE,
      onlyFiles: true,
      followSymbolicLinks: false,
      deep: MAX_TRAVERSAL_DEPTH,
    }),
  ]);

  return {
    vitest: { installed: "vitest" in dependencies },
    jest: { installed: "jest" in dependencies },
    ava: { installed: "ava" in dependencies },
    mocha: { installed: "mocha" in dependencies },
    playwright: {
      installed:
        "@playwright/test" in dependencies || "playwright" in dependencies,
    },
    cypress: { installed: "cypress" in dependencies },
    nodeTest: { detected: usesNodeTestRunner(scripts) },
    hasTestFiles: testFiles.length > 0,
    hasE2eTestFiles: e2eFiles.length > 0,
  };
}
