import type { PackageJson } from "../parsers/package-json.js";
import type { ProjectProfile } from "../types/profile.js";

const NODE_BACKEND_FRAMEWORK_DEPENDENCIES = [
  "express",
  "fastify",
  "koa",
  "@nestjs/core",
  "@hapi/hapi",
];

const TANSTACK_START_DEPENDENCIES = [
  "@tanstack/start",
  "@tanstack/react-start",
];

export function detectProjectProfile(
  dependencies: Record<string, string>,
  packageJson: PackageJson | undefined,
): ProjectProfile {
  if ("next" in dependencies) {
    return "nextjs";
  }

  if (TANSTACK_START_DEPENDENCIES.some((dep) => dep in dependencies)) {
    return "tanstack-start";
  }

  if (
    "vite" in dependencies &&
    ("react" in dependencies || "react-dom" in dependencies)
  ) {
    return "vite-react";
  }

  if (packageJson?.bin !== undefined) {
    return "node-cli";
  }

  if (NODE_BACKEND_FRAMEWORK_DEPENDENCIES.some((dep) => dep in dependencies)) {
    return "node-backend";
  }

  if (
    !packageJson?.private &&
    (packageJson?.main !== undefined || packageJson?.exports !== undefined)
  ) {
    return "npm-library";
  }

  return "generic";
}
