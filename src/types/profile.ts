export const PROJECT_PROFILES = [
  "nextjs",
  "vite-react",
  "tanstack-start",
  "node-backend",
  "node-cli",
  "npm-library",
  "generic",
] as const;

export type ProjectProfile = (typeof PROJECT_PROFILES)[number];
