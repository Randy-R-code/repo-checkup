import type { Category } from "./category.js";
import type { RepositoryContext } from "./context.js";

export type CheckStatus = "pass" | "warning" | "error" | "skipped";

export interface CheckResult {
  id: string;
  category: Category;
  status: CheckStatus;
  title: string;
  weight: number;
  message: string | undefined;
  recommendation: string | undefined;
}

export interface Check {
  id: string;
  category: Category;
  title: string;
  weight: number;
  applies(context: RepositoryContext): boolean;
  run(context: RepositoryContext): CheckResult;
}
