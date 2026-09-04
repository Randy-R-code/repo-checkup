import { type ParseError, parse as parseJsonc } from "jsonc-parser";
import path from "node:path";
import { safeReadFile } from "../utils/safe-read.js";

export interface TsConfig {
  compilerOptions: {
    strict: boolean | undefined;
    noUncheckedIndexedAccess: boolean | undefined;
  };
  include: string[] | undefined;
  exclude: string[] | undefined;
}

export async function readTsConfig(
  targetPath: string,
): Promise<TsConfig | undefined> {
  const filePath = path.join(targetPath, "tsconfig.json");
  const raw = await safeReadFile(targetPath, filePath);

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
    compilerOptions: {
      strict:
        typeof compilerOptions.strict === "boolean"
          ? compilerOptions.strict
          : undefined,
      noUncheckedIndexedAccess:
        typeof compilerOptions.noUncheckedIndexedAccess === "boolean"
          ? compilerOptions.noUncheckedIndexedAccess
          : undefined,
    },
    include: isStringArray(parsed.include) ? parsed.include : undefined,
    exclude: isStringArray(parsed.exclude) ? parsed.exclude : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}
