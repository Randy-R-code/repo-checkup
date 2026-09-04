export interface TestingEvidence {
  vitest: { installed: boolean };
  jest: { installed: boolean };
  ava: { installed: boolean };
  mocha: { installed: boolean };
  playwright: { installed: boolean };
  cypress: { installed: boolean };
  hasTestFiles: boolean;
  hasE2eTestFiles: boolean;
}
