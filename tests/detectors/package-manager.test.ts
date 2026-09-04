import { describe, expect, it } from "vitest";
import { detectPackageManager } from "../../src/detectors/package-manager.js";

describe("detectPackageManager", () => {
  it("prefers the packageManager field over lockfiles", () => {
    expect(detectPackageManager("pnpm@10.33.0", ["package-lock.json"])).toBe(
      "pnpm",
    );
  });

  it("ignores an unrecognized packageManager field value", () => {
    expect(detectPackageManager("not-a-package-manager@1.0.0", [])).toBe(
      "unknown",
    );
  });

  it("falls back to a single lockfile", () => {
    expect(detectPackageManager(undefined, ["yarn.lock"])).toBe("yarn");
  });

  it("picks the highest-priority lockfile when several are present", () => {
    expect(
      detectPackageManager(undefined, ["package-lock.json", "pnpm-lock.yaml"]),
    ).toBe("pnpm");
  });

  it("returns unknown when there is no evidence", () => {
    expect(detectPackageManager(undefined, [])).toBe("unknown");
  });
});
