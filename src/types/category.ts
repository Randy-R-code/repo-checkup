export const CATEGORIES = [
  "project",
  "typescript",
  "tooling",
  "testing",
  "ci",
  "repository",
] as const;

export type Category = (typeof CATEGORIES)[number];
