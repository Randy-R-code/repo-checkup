import type { Check } from "../../types/check.js";
import type { RepositoryContext } from "../../types/context.js";
import { createResult } from "../helpers.js";

function isTypeScriptProject(context: RepositoryContext): boolean {
  return context.dependencies.typescript !== undefined || context.hasTsconfig;
}

export const tsconfigFound: Check = {
  id: "typescript/tsconfig-found",
  category: "typescript",
  title: "tsconfig.json is present",
  weight: 4,
  applies: isTypeScriptProject,
  run: (context) => {
    if (!context.hasTsconfig) {
      return createResult(
        tsconfigFound,
        "error",
        "TypeScript is used, but no tsconfig.json was found at the repository root.",
        "Add a tsconfig.json so TypeScript and editors compile the project consistently.",
      );
    }

    return createResult(tsconfigFound, "pass");
  },
};

export const tsconfigValid: Check = {
  id: "typescript/tsconfig-valid",
  category: "typescript",
  title: "tsconfig.json can be parsed",
  weight: 4,
  applies: (context) => context.hasTsconfig,
  run: (context) => {
    if (context.tsconfig === undefined) {
      return createResult(
        tsconfigValid,
        "error",
        "tsconfig.json exists but could not be parsed as JSON/JSONC.",
        "Fix the tsconfig.json syntax so tooling can read it.",
      );
    }

    return createResult(tsconfigValid, "pass");
  },
};

export const strictMode: Check = {
  id: "typescript/strict",
  category: "typescript",
  title: "TypeScript strict mode is enabled",
  weight: 3,
  applies: (context) =>
    context.tsconfig !== undefined &&
    // When strict isn't set on the resolved config and part of the
    // `extends` chain couldn't be resolved (a package preset, a cycle, a
    // missing file), we can't tell whether it's inherited from there.
    // Skip rather than report a false "not enabled".
    !(
      context.tsconfig.compilerOptions.strict === undefined &&
      context.tsconfig.hasUnresolvedExtends
    ),
  run: (context) => {
    if (context.tsconfig?.compilerOptions.strict !== true) {
      return createResult(
        strictMode,
        "warning",
        "compilerOptions.strict is not enabled.",
        "Enable strict mode for stronger type safety.",
      );
    }

    return createResult(strictMode, "pass");
  },
};

export const typescriptInstalled: Check = {
  id: "typescript/typescript-installed",
  category: "typescript",
  title: "typescript package is installed",
  weight: 4,
  applies: isTypeScriptProject,
  run: (context) => {
    if (context.dependencies.typescript === undefined) {
      return createResult(
        typescriptInstalled,
        "error",
        "A tsconfig.json was found, but the typescript package is not a dependency.",
        "Install typescript as a dev dependency.",
      );
    }

    return createResult(typescriptInstalled, "pass");
  },
};

export const typecheckScript: Check = {
  id: "typescript/typecheck-script",
  category: "typescript",
  title: "A typecheck script is defined",
  weight: 2,
  applies: isTypeScriptProject,
  run: (context) => {
    const hasTypecheckScript = Object.values(context.scripts).some((script) =>
      script.includes("tsc"),
    );

    if (!hasTypecheckScript) {
      return createResult(
        typecheckScript,
        "warning",
        "No package.json script runs the TypeScript compiler.",
        "Add a typecheck script (for example `tsc --noEmit`) so type errors can be caught locally and in CI.",
      );
    }

    return createResult(typecheckScript, "pass");
  },
};

export const typescriptChecks: Check[] = [
  tsconfigFound,
  tsconfigValid,
  strictMode,
  typescriptInstalled,
  typecheckScript,
];
