import { describe, expect, it } from "vitest";
import {
  e2eTestsPresent,
  testFilesPresent,
  testRunnerDetected,
  testScript,
  testingChecks,
} from "../../../src/checks/testing/index.js";
import { createContext } from "../../helpers/context.js";

describe("testRunnerDetected", () => {
  it("warns when no unit test runner is installed", () => {
    expect(testRunnerDetected.run(createContext()).status).toBe("warning");
  });

  it("passes when Vitest is installed", () => {
    const context = createContext({
      testing: {
        vitest: { installed: true },
        jest: { installed: false },
        ava: { installed: false },
        mocha: { installed: false },
        playwright: { installed: false },
        cypress: { installed: false },
        hasTestFiles: false,
        hasE2eTestFiles: false,
      },
    });

    expect(testRunnerDetected.run(context).status).toBe("pass");
  });
});

describe("testScript", () => {
  const withVitest = {
    vitest: { installed: true },
    jest: { installed: false },
    ava: { installed: false },
    mocha: { installed: false },
    playwright: { installed: false },
    cypress: { installed: false },
    hasTestFiles: false,
    hasE2eTestFiles: false,
  };

  it("does not apply without a unit test runner", () => {
    expect(testScript.applies(createContext())).toBe(false);
  });

  it('warns when no "test" script is defined', () => {
    const context = createContext({ testing: withVitest });

    expect(testScript.run(context).status).toBe("warning");
  });

  it('passes when a "test" script is defined', () => {
    const context = createContext({
      testing: withVitest,
      scripts: { test: "vitest run" },
    });

    expect(testScript.run(context).status).toBe("pass");
  });
});

describe("testFilesPresent", () => {
  it("warns when a runner is installed but no test files exist", () => {
    const context = createContext({
      testing: {
        vitest: { installed: true },
        jest: { installed: false },
        ava: { installed: false },
        mocha: { installed: false },
        playwright: { installed: false },
        cypress: { installed: false },
        hasTestFiles: false,
        hasE2eTestFiles: false,
      },
    });

    expect(testFilesPresent.run(context).status).toBe("warning");
  });

  it("passes when test files exist", () => {
    const context = createContext({
      testing: {
        vitest: { installed: true },
        jest: { installed: false },
        ava: { installed: false },
        mocha: { installed: false },
        playwright: { installed: false },
        cypress: { installed: false },
        hasTestFiles: true,
        hasE2eTestFiles: false,
      },
    });

    expect(testFilesPresent.run(context).status).toBe("pass");
  });
});

describe("e2eTestsPresent", () => {
  it("does not apply without an e2e tool", () => {
    expect(e2eTestsPresent.applies(createContext())).toBe(false);
  });

  it("warns when installed but no e2e test files exist", () => {
    const context = createContext({
      testing: {
        vitest: { installed: false },
        jest: { installed: false },
        ava: { installed: false },
        mocha: { installed: false },
        playwright: { installed: true },
        cypress: { installed: false },
        hasTestFiles: false,
        hasE2eTestFiles: false,
      },
    });

    expect(e2eTestsPresent.run(context).status).toBe("warning");
  });

  it("passes when e2e test files exist", () => {
    const context = createContext({
      testing: {
        vitest: { installed: false },
        jest: { installed: false },
        ava: { installed: false },
        mocha: { installed: false },
        playwright: { installed: true },
        cypress: { installed: false },
        hasTestFiles: false,
        hasE2eTestFiles: true,
      },
    });

    expect(e2eTestsPresent.run(context).status).toBe("pass");
  });
});

describe("testingChecks", () => {
  it("exposes every testing check", () => {
    expect(testingChecks).toHaveLength(4);
  });
});
