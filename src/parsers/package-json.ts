import { readFile } from "node:fs/promises";
import path from "node:path";

export interface PackageJson {
  name: string | undefined;
  version: string | undefined;
  private: boolean | undefined;
  type: string | undefined;
  main: string | undefined;
  bin: string | Record<string, string> | undefined;
  exports: unknown;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export async function readPackageJson(
  targetPath: string,
): Promise<PackageJson | undefined> {
  const filePath = path.join(targetPath, "package.json");

  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  const pkg = parsed as Record<string, unknown>;

  return {
    name: typeof pkg.name === "string" ? pkg.name : undefined,
    version: typeof pkg.version === "string" ? pkg.version : undefined,
    private: typeof pkg.private === "boolean" ? pkg.private : undefined,
    type: typeof pkg.type === "string" ? pkg.type : undefined,
    main: typeof pkg.main === "string" ? pkg.main : undefined,
    bin: isBinField(pkg.bin) ? pkg.bin : undefined,
    exports: pkg.exports,
    scripts: isStringRecord(pkg.scripts) ? pkg.scripts : {},
    dependencies: isStringRecord(pkg.dependencies) ? pkg.dependencies : {},
    devDependencies: isStringRecord(pkg.devDependencies)
      ? pkg.devDependencies
      : {},
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

function isBinField(value: unknown): value is string | Record<string, string> {
  return typeof value === "string" || isStringRecord(value);
}
