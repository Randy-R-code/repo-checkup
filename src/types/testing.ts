export interface TestingEvidence {
  vitest: { installed: boolean };
  jest: { installed: boolean };
  playwright: { installed: boolean };
  cypress: { installed: boolean };
  hasTestFiles: boolean;
  hasE2eTestFiles: boolean;
}
