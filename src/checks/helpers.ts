import type { Check, CheckResult, CheckStatus } from "../types/check.js";

export function createResult(
  check: Pick<Check, "id" | "category" | "title">,
  status: CheckStatus,
  message?: string,
  recommendation?: string,
): CheckResult {
  return {
    id: check.id,
    category: check.category,
    status,
    title: check.title,
    message,
    recommendation,
  };
}
