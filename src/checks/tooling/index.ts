import type { Check } from "../../types/check.js";
import type { RepositoryContext } from "../../types/context.js";
import type { ToolEvidence } from "../../types/tooling.js";
import { createResult } from "../helpers.js";

function createToolConsistencyCheck(
  id: string,
  title: string,
  weight: number,
  displayName: string,
  getEvidence: (context: RepositoryContext) => ToolEvidence,
): Check {
  const check: Check = {
    id,
    category: "tooling",
    title,
    weight,
    applies: (context) => {
      const evidence = getEvidence(context);
      return evidence.installed || evidence.configured;
    },
    run: (context) => {
      const evidence = getEvidence(context);

      if (evidence.installed && !evidence.configured) {
        return createResult(
          check,
          "warning",
          `${displayName} is installed, but no configuration file was found.`,
          `Add a ${displayName} configuration file, or remove the dependency if it is unused.`,
        );
      }

      if (!evidence.installed && evidence.configured) {
        return createResult(
          check,
          "error",
          `A ${displayName} configuration file was found, but ${displayName} is not a dependency.`,
          `Install ${displayName} so the configuration actually takes effect.`,
        );
      }

      return createResult(check, "pass");
    },
  };

  return check;
}

export const eslintConsistency = createToolConsistencyCheck(
  "tooling/eslint-consistency",
  "ESLint configuration matches installation",
  2,
  "ESLint",
  (context) => context.tooling.eslint,
);

export const biomeConsistency = createToolConsistencyCheck(
  "tooling/biome-consistency",
  "Biome configuration matches installation",
  2,
  "Biome",
  (context) => context.tooling.biome,
);

export const prettierConsistency = createToolConsistencyCheck(
  "tooling/prettier-consistency",
  "Prettier configuration matches installation",
  2,
  "Prettier",
  (context) => context.tooling.prettier,
);

export const overlappingLinters: Check = {
  id: "tooling/overlapping-linters",
  category: "tooling",
  title: "No overlapping lint/format tools",
  weight: 2,
  applies: () => true,
  run: (context) => {
    const eslintPresent =
      context.tooling.eslint.installed || context.tooling.eslint.configured;
    const biomePresent =
      context.tooling.biome.installed || context.tooling.biome.configured;

    if (eslintPresent && biomePresent) {
      return createResult(
        overlappingLinters,
        "warning",
        "Both ESLint and Biome appear to be set up in this repository.",
        "Standardize on a single linter/formatter to avoid contradictory rules and redundant tooling.",
      );
    }

    return createResult(overlappingLinters, "pass");
  },
};

export const toolingChecks: Check[] = [
  eslintConsistency,
  biomeConsistency,
  prettierConsistency,
  overlappingLinters,
];
