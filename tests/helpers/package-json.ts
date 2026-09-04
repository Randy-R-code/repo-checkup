import type { PackageJson } from "../../src/parsers/package-json.js";

export function createPackageJson(
  overrides: Partial<PackageJson> = {},
): PackageJson {
  return {
    name: undefined,
    version: undefined,
    private: undefined,
    type: undefined,
    packageManager: undefined,
    main: undefined,
    bin: undefined,
    exports: undefined,
    scripts: {},
    dependencies: {},
    devDependencies: {},
    ...overrides,
  };
}
