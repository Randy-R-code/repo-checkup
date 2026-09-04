import { glob } from "tinyglobby";
import type { TestingEvidence } from "../types/testing.js";

const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
  "**/.git/**",
];

const TEST_FILE_PATTERNS = ["**/*.{test,spec}.{js,jsx,ts,tsx}"];

const E2E_FILE_PATTERNS = [
  "e2e/**/*.{js,jsx,ts,tsx}",
  "tests/e2e/**/*.{js,jsx,ts,tsx}",
  "cypress/**/*.cy.{js,jsx,ts,tsx}",
  "cypress/e2e/**/*.{js,jsx,ts,tsx}",
];

export async function detectTesting(
  targetPath: string,
  dependencies: Record<string, string>,
): Promise<TestingEvidence> {
  const [testFiles, e2eFiles] = await Promise.all([
    glob(TEST_FILE_PATTERNS, {
      cwd: targetPath,
      ignore: IGNORE,
      onlyFiles: true,
    }),
    glob(E2E_FILE_PATTERNS, {
      cwd: targetPath,
      ignore: IGNORE,
      onlyFiles: true,
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
