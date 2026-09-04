import type { Check } from "../../types/check.js";
import { createResult } from "../helpers.js";

export const readmePresent: Check = {
  id: "repository/readme-present",
  category: "repository",
  title: "README is present",
  weight: 2,
  applies: () => true,
  run: (context) => {
    if (!context.repository.hasReadme) {
      return createResult(
        readmePresent,
        "warning",
        "No README.md was found.",
        "Add a README describing what the project does and how to use it.",
      );
    }

    return createResult(readmePresent, "pass");
  },
};

export const licensePresent: Check = {
  id: "repository/license-present",
  category: "repository",
  title: "LICENSE is present",
  weight: 2,
  applies: (context) => context.packageJson?.private !== true,
  run: (context) => {
    if (!context.repository.hasLicense) {
      return createResult(
        licensePresent,
        "warning",
        "No LICENSE file was found.",
        "Add a LICENSE file so others know how they may use the project.",
      );
    }

    return createResult(licensePresent, "pass");
  },
};

export const gitignorePresent: Check = {
  id: "repository/gitignore-present",
  category: "repository",
  title: ".gitignore is present",
  weight: 2,
  applies: () => true,
  run: (context) => {
    if (!context.repository.hasGitignore) {
      return createResult(
        gitignorePresent,
        "warning",
        "No .gitignore was found.",
        "Add a .gitignore so build output and local files are not committed by mistake.",
      );
    }

    return createResult(gitignorePresent, "pass");
  },
};

export const envFileIgnored: Check = {
  id: "repository/env-file-ignored",
  category: "repository",
  title: ".env files are excluded from version control",
  weight: 5,
  applies: (context) => context.repository.hasEnvFile,
  run: (context) => {
    if (!context.repository.gitignoreCoversEnvFiles) {
      return createResult(
        envFileIgnored,
        "error",
        "A .env file exists, but .gitignore does not appear to exclude it.",
        "Add a .env (or .env*) entry to .gitignore, and make sure the file isn't already tracked by git.",
      );
    }

    return createResult(envFileIgnored, "pass");
  },
};

export const envExamplePresent: Check = {
  id: "repository/env-example-present",
  category: "repository",
  title: ".env.example documents required environment variables",
  weight: 1,
  applies: (context) => context.repository.hasEnvFile,
  run: (context) => {
    if (!context.repository.hasEnvExample) {
      return createResult(
        envExamplePresent,
        "warning",
        "A .env file is used, but no .env.example (or .env.sample) was found.",
        "Add a .env.example listing the required environment variables without their real values.",
      );
    }

    return createResult(envExamplePresent, "pass");
  },
};

export const repositoryChecks: Check[] = [
  readmePresent,
  licensePresent,
  gitignorePresent,
  envFileIgnored,
  envExamplePresent,
];
