import path from "node:path";
import type { ToolEvidence, ToolingEvidence } from "../types/tooling.js";
import { fileExists } from "../utils/fs.js";

const CONFIG_FILES = {
  eslint: [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.ts",
    ".eslintrc.json",
    ".eslintrc.js",
    ".eslintrc",
  ],
  biome: ["biome.json", "biome.jsonc"],
  prettier: [
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    "prettier.config.js",
    "prettier.config.mjs",
  ],
} as const;

const DEPENDENCY_NAMES = {
  eslint: "eslint",
  biome: "@biomejs/biome",
  prettier: "prettier",
} as const;

type ToolName = keyof typeof CONFIG_FILES;

export async function detectTooling(
  targetPath: string,
  dependencies: Record<string, string>,
): Promise<ToolingEvidence> {
  const [eslint, biome, prettier] = await Promise.all([
    detectTool(targetPath, dependencies, "eslint"),
    detectTool(targetPath, dependencies, "biome"),
    detectTool(targetPath, dependencies, "prettier"),
  ]);

  return { eslint, biome, prettier };
}

async function detectTool(
  targetPath: string,
  dependencies: Record<string, string>,
  tool: ToolName,
): Promise<ToolEvidence> {
  const installed = DEPENDENCY_NAMES[tool] in dependencies;
  const configChecks = await Promise.all(
    CONFIG_FILES[tool].map((name) => fileExists(path.join(targetPath, name))),
  );

  return { installed, configured: configChecks.some(Boolean) };
}
