export interface RepositoryHygieneEvidence {
  hasReadme: boolean;
  hasLicense: boolean;
  hasGitignore: boolean;
  gitignoreCoversEnvFiles: boolean;
  hasEnvFile: boolean;
  hasEnvExample: boolean;
}
