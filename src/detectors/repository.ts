import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RepositoryHygieneEvidence } from "../types/repository.js";
import { fileExists } from "../utils/fs.js";

const README_FILES = ["README.md", "README"];
const LICENSE_FILES = ["LICENSE", "LICENSE.md", "LICENSE.txt"];
const ENV_EXAMPLE_FILES = [".env.example", ".env.sample"];
const ENV_IGNORE_PATTERNS = [".env", ".env.*", ".env*", "*.env"];

export async function detectRepositoryHygiene(
  targetPath: string,
): Promise<RepositoryHygieneEvidence> {
  const [hasReadme, hasLicense, hasGitignore, hasEnvFile, hasEnvExample] =
    await Promise.all([
      anyFileExists(targetPath, README_FILES),
      anyFileExists(targetPath, LICENSE_FILES),
      fileExists(path.join(targetPath, ".gitignore")),
      fileExists(path.join(targetPath, ".env")),
      anyFileExists(targetPath, ENV_EXAMPLE_FILES),
    ]);

  const gitignoreCoversEnvFiles = hasGitignore
    ? await gitignoreCoversEnv(targetPath)
    : false;

  return {
    hasReadme,
    hasLicense,
    hasGitignore,
    gitignoreCoversEnvFiles,
    hasEnvFile,
    hasEnvExample,
  };
}

async function anyFileExists(
  targetPath: string,
  names: string[],
): Promise<boolean> {
  const results = await Promise.all(
    names.map((name) => fileExists(path.join(targetPath, name))),
  );

  return results.some(Boolean);
}

async function gitignoreCoversEnv(targetPath: string): Promise<boolean> {
  let raw: string;
  try {
    raw = await readFile(path.join(targetPath, ".gitignore"), "utf8");
  } catch {
    return false;
  }

  const patterns = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return patterns.some((pattern) => ENV_IGNORE_PATTERNS.includes(pattern));
}
