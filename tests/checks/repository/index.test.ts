import { describe, expect, it } from "vitest";
import {
  envExamplePresent,
  envFileIgnored,
  gitignorePresent,
  licensePresent,
  readmePresent,
  repositoryChecks,
} from "../../../src/checks/repository/index.js";
import { createContext } from "../../helpers/context.js";
import { createPackageJson } from "../../helpers/package-json.js";

describe("readmePresent", () => {
  it("warns when no README exists", () => {
    expect(readmePresent.run(createContext()).status).toBe("warning");
  });

  it("passes when a README exists", () => {
    const context = createContext({
      repository: {
        hasReadme: true,
        hasLicense: false,
        hasGitignore: false,
        gitignoreCoversEnvFiles: false,
        hasEnvFile: false,
        hasEnvExample: false,
      },
    });

    expect(readmePresent.run(context).status).toBe("pass");
  });
});

describe("licensePresent", () => {
  it("does not apply to a private package", () => {
    const context = createContext({
      packageJson: createPackageJson({ private: true }),
    });

    expect(licensePresent.applies(context)).toBe(false);
  });

  it("warns when no LICENSE exists", () => {
    expect(licensePresent.run(createContext()).status).toBe("warning");
  });
});

describe("gitignorePresent", () => {
  it("warns when no .gitignore exists", () => {
    expect(gitignorePresent.run(createContext()).status).toBe("warning");
  });
});

describe("envFileIgnored", () => {
  it("does not apply without a .env file", () => {
    expect(envFileIgnored.applies(createContext())).toBe(false);
  });

  it("errors when .env exists but is not covered by .gitignore", () => {
    const context = createContext({
      repository: {
        hasReadme: false,
        hasLicense: false,
        hasGitignore: true,
        gitignoreCoversEnvFiles: false,
        hasEnvFile: true,
        hasEnvExample: false,
      },
    });

    expect(envFileIgnored.applies(context)).toBe(true);
    expect(envFileIgnored.run(context).status).toBe("error");
  });

  it("passes when .env is covered by .gitignore", () => {
    const context = createContext({
      repository: {
        hasReadme: false,
        hasLicense: false,
        hasGitignore: true,
        gitignoreCoversEnvFiles: true,
        hasEnvFile: true,
        hasEnvExample: false,
      },
    });

    expect(envFileIgnored.run(context).status).toBe("pass");
  });
});

describe("envExamplePresent", () => {
  it("warns when .env exists without a .env.example", () => {
    const context = createContext({
      repository: {
        hasReadme: false,
        hasLicense: false,
        hasGitignore: false,
        gitignoreCoversEnvFiles: false,
        hasEnvFile: true,
        hasEnvExample: false,
      },
    });

    expect(envExamplePresent.run(context).status).toBe("warning");
  });
});

describe("repositoryChecks", () => {
  it("exposes every repository check", () => {
    expect(repositoryChecks).toHaveLength(5);
  });
});
