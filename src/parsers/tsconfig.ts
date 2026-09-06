import { type ParseError, parse as parseJsonc } from "jsonc-parser";
import path from "node:path";
import { resolveWithinRoot, safeReadFile } from "../utils/safe-read.js";

export interface TsConfig {
  compilerOptions: {
    strict: boolean | undefined;
    noUncheckedIndexedAccess: boolean | undefined;
  };
  include: string[] | undefined;
  exclude: string[] | undefined;
  /**
   * True when an `extends` chain could not be fully resolved statically
   * (a package-based preset, a missing/malformed base config, an inheritance
   * cycle, or a path escaping the repository root). Checks that rely on
   * inherited compiler options should treat an undefined value as unknown
   * rather than "disabled" when this is set, to avoid false positives.
   */
  hasUnresolvedExtends: boolean;
}

interface RawTsConfig {
  compilerOptions: Record<string, unknown>;
  include: string[] | undefined;
  exclude: string[] | undefined;
  extends: unknown;
}

// Bounds `extends` chain traversal against a pathological or malicious
// inheritance chain; well beyond any realistic tsconfig setup.
const MAX_EXTENDS_DEPTH = 8;

export async function readTsConfig(
  targetPath: string,
): Promise<TsConfig | undefined> {
  const rootFilePath = path.join(targetPath, "tsconfig.json");
  const rootFile = await readTsConfigFile(targetPath, rootFilePath);

  if (rootFile === undefined) {
    return undefined;
  }

  const chain: RawTsConfig[] = [rootFile.config];
  const visited = new Set<string>([rootFile.resolvedPath]);
  let hasUnresolvedExtends = false;
  let currentDir = path.dirname(rootFile.resolvedPath);
  let currentExtends = rootFile.config.extends;
  let depth = 0;

  while (currentExtends !== undefined) {
    if (depth >= MAX_EXTENDS_DEPTH) {
      hasUnresolvedExtends = true;
      break;
    }
    depth += 1;

    if (
      typeof currentExtends !== "string" ||
      !isRelativeSpecifier(currentExtends)
    ) {
      // Package-based presets (e.g. "@tsconfig/node22/tsconfig.json") are
      // not resolved without reaching into node_modules; treat them, and
      // any other unsupported extends shape, conservatively.
      hasUnresolvedExtends = true;
      break;
    }

    const candidatePath = resolveExtendsSpecifier(currentDir, currentExtends);
    const baseFile = await readTsConfigFile(targetPath, candidatePath);

    if (baseFile === undefined) {
      // Missing, malformed, or outside the repository root.
      hasUnresolvedExtends = true;
      break;
    }

    if (visited.has(baseFile.resolvedPath)) {
      // Inheritance cycle.
      hasUnresolvedExtends = true;
      break;
    }

    visited.add(baseFile.resolvedPath);
    chain.push(baseFile.config);
    currentDir = path.dirname(baseFile.resolvedPath);
    currentExtends = baseFile.config.extends;
  }

  const mergedCompilerOptions: Record<string, unknown> = {};
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    Object.assign(mergedCompilerOptions, chain[i]?.compilerOptions);
  }

  return {
    compilerOptions: {
      strict:
        typeof mergedCompilerOptions.strict === "boolean"
          ? mergedCompilerOptions.strict
          : undefined,
      noUncheckedIndexedAccess:
        typeof mergedCompilerOptions.noUncheckedIndexedAccess === "boolean"
          ? mergedCompilerOptions.noUncheckedIndexedAccess
          : undefined,
    },
    include: rootFile.config.include,
    exclude: rootFile.config.exclude,
    hasUnresolvedExtends,
  };
}

async function readTsConfigFile(
  root: string,
  filePath: string,
): Promise<{ resolvedPath: string; config: RawTsConfig } | undefined> {
  const resolvedPath = await resolveWithinRoot(root, filePath);
  if (resolvedPath === undefined) {
    return undefined;
  }

  const raw = await safeReadFile(root, resolvedPath);
  if (raw === undefined) {
    return undefined;
  }

  const errors: ParseError[] = [];
  const parsed: unknown = parseJsonc(raw, errors, {
    allowTrailingComma: true,
  });

  if (errors.length > 0 || !isRecord(parsed)) {
    return undefined;
  }

  const compilerOptions = isRecord(parsed.compilerOptions)
    ? parsed.compilerOptions
    : {};

  return {
    resolvedPath,
    config: {
      compilerOptions,
      include: isStringArray(parsed.include) ? parsed.include : undefined,
      exclude: isStringArray(parsed.exclude) ? parsed.exclude : undefined,
      extends: parsed.extends,
    },
  };
}

function isRelativeSpecifier(value: string): boolean {
  return value.startsWith("./") || value.startsWith("../");
}

function resolveExtendsSpecifier(fromDir: string, specifier: string): string {
  const withExtension = specifier.endsWith(".json")
    ? specifier
    : `${specifier}.json`;

  return path.join(fromDir, withExtension);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}
