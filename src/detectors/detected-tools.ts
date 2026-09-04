import type { RepositoryContext } from "../types/context.js";

export function detectDetectedTools(context: RepositoryContext): string[] {
  const tools: string[] = [];

  if (context.testing.vitest.installed) tools.push("vitest");
  if (context.testing.jest.installed) tools.push("jest");
  if (context.testing.ava.installed) tools.push("ava");
  if (context.testing.mocha.installed) tools.push("mocha");
  if (context.testing.playwright.installed) tools.push("playwright");
  if (context.testing.cypress.installed) tools.push("cypress");

  if (context.tooling.eslint.installed || context.tooling.eslint.configured) {
    tools.push("eslint");
  }
  if (context.tooling.biome.installed || context.tooling.biome.configured) {
    tools.push("biome");
  }
  if (
    context.tooling.prettier.installed ||
    context.tooling.prettier.configured
  ) {
    tools.push("prettier");
  }

  if (context.githubActionsWorkflows.length > 0) {
    tools.push("github-actions");
  }

  return tools;
}
