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

const TEST_FILE_PATTERNS = ["**/*.{test,spec}.{js,jsx,ts,tsx}"];

const E2E_FILE_PATTERNS = [
  "e2e/**/*.{js,jsx,ts,tsx}",
  "tests/e2e/**/*.{js,jsx,ts,tsx}",
  "cypress/**/*.cy.{js,jsx,ts,tsx}",
  "cypress/e2e/**/*.{js,jsx,ts,tsx}",
];

// Bounds traversal against a pathologically deep directory tree; well
// beyond any realistic (even monorepo) source layout.
const MAX_TRAVERSAL_DEPTH = 30;

export async function detectTesting(
  targetPath: string,
  dependencies: Record<string, string>,
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
    playwright: {
      installed:
        "@playwright/test" in dependencies || "playwright" in dependencies,
    },
    cypress: { installed: "cypress" in dependencies },
    hasTestFiles: testFiles.length > 0,
    hasE2eTestFiles: e2eFiles.length > 0,
  };
}
