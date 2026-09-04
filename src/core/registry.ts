import type { Check, CheckResult } from "../types/check.js";
import type { RepositoryContext } from "../types/context.js";

export function runChecks(
  checks: Check[],
  context: RepositoryContext,
): CheckResult[] {
  return checks
    .filter((check) => check.applies(context))
    .map((check) => check.run(context));
}
