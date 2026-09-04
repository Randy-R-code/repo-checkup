import { describe, expect, it } from "vitest";
import {
  strictMode,
  tsconfigFound,
  tsconfigValid,
  typecheckScript,
  typescriptChecks,
  typescriptInstalled,
} from "../../../src/checks/typescript/index.js";
import { createContext } from "../../helpers/context.js";

const emptyTsConfig = {
  compilerOptions: { strict: undefined, noUncheckedIndexedAccess: undefined },
  include: undefined,
  exclude: undefined,
};

describe("category applicability", () => {
  it("does not apply to a project without TypeScript", () => {
    const context = createContext();

    expect(tsconfigFound.applies(context)).toBe(false);
    expect(typescriptInstalled.applies(context)).toBe(false);
    expect(typecheckScript.applies(context)).toBe(false);
  });

  it("applies when the typescript package is a dependency", () => {
    expect(
      tsconfigFound.applies(
        createContext({ dependencies: { typescript: "^5.0.0" } }),
      ),
    ).toBe(true);
  });

  it("applies when a tsconfig.json is present", () => {
    expect(tsconfigFound.applies(createContext({ hasTsconfig: true }))).toBe(
      true,
    );
  });
});

describe("tsconfigFound", () => {
  it("errors when tsconfig.json is missing", () => {
    const context = createContext({
      dependencies: { typescript: "^5.0.0" },
    });

    expect(tsconfigFound.run(context).status).toBe("error");
  });

  it("passes when tsconfig.json is present", () => {
    const context = createContext({ hasTsconfig: true });

    expect(tsconfigFound.run(context).status).toBe("pass");
  });
});

describe("tsconfigValid", () => {
  it("does not apply without a tsconfig.json", () => {
    expect(tsconfigValid.applies(createContext())).toBe(false);
  });

  it("errors when tsconfig.json could not be parsed", () => {
    const context = createContext({ hasTsconfig: true, tsconfig: undefined });

    expect(tsconfigValid.run(context).status).toBe("error");
  });

  it("passes when tsconfig.json was parsed", () => {
    const context = createContext({
      hasTsconfig: true,
      tsconfig: emptyTsConfig,
    });

    expect(tsconfigValid.run(context).status).toBe("pass");
  });
});

describe("strictMode", () => {
  it("warns when strict is not enabled", () => {
    const context = createContext({ tsconfig: emptyTsConfig });

    expect(strictMode.run(context).status).toBe("warning");
  });

  it("passes when strict is enabled", () => {
    const context = createContext({
      tsconfig: {
        ...emptyTsConfig,
        compilerOptions: { ...emptyTsConfig.compilerOptions, strict: true },
      },
    });

    expect(strictMode.run(context).status).toBe("pass");
  });
});

describe("typescriptInstalled", () => {
  it("errors when tsconfig.json exists without the typescript dependency", () => {
    const context = createContext({ hasTsconfig: true });

    expect(typescriptInstalled.run(context).status).toBe("error");
  });

  it("passes when typescript is a dependency", () => {
    const context = createContext({
      hasTsconfig: true,
      dependencies: { typescript: "^5.0.0" },
    });

    expect(typescriptInstalled.run(context).status).toBe("pass");
  });
});

describe("typecheckScript", () => {
  it("warns when no script runs tsc", () => {
    const context = createContext({
      dependencies: { typescript: "^5.0.0" },
      scripts: { build: "tsdown" },
    });

    expect(typecheckScript.run(context).status).toBe("warning");
  });

  it("passes when a script runs tsc", () => {
    const context = createContext({
      dependencies: { typescript: "^5.0.0" },
      scripts: { typecheck: "tsc --noEmit" },
    });

    expect(typecheckScript.run(context).status).toBe("pass");
  });
});

describe("typescriptChecks", () => {
  it("exposes every typescript check", () => {
    expect(typescriptChecks).toHaveLength(5);
  });
});
