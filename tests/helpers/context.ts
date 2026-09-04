import type { RepositoryContext } from "../../src/types/context.js";

export function createContext(
  overrides: Partial<RepositoryContext> = {},
): RepositoryContext {
  return {
    targetPath: "/repo",
    packageJson: undefined,
    scripts: {},
    dependencies: {},
    lockfiles: [],
    profile: "generic",
    packageManager: "unknown",
    hasTsconfig: false,
    tsconfig: undefined,
    tooling: {
      eslint: { installed: false, configured: false },
      biome: { installed: false, configured: false },
      prettier: { installed: false, configured: false },
    },
    ...overrides,
  };
}
