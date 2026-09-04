import { describe, expect, it } from "vitest";
import { getCliMeta } from "../src/cli.js";

describe("getCliMeta", () => {
  it("returns the RepoCheckup CLI metadata", () => {
    const meta = getCliMeta();

    expect(meta.name).toBe("RepoCheckup");
    expect(meta.version).toBe("0.1.0");
    expect(meta.tagline).toBe(
      "Give your JavaScript or TypeScript repository a quick checkup.",
    );
  });
});
