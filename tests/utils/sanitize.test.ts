import { describe, expect, it } from "vitest";
import { sanitizeForDisplay } from "../../src/utils/sanitize.js";

const ESC = String.fromCharCode(27);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);

describe("sanitizeForDisplay", () => {
  it("leaves normal text untouched", () => {
    expect(sanitizeForDisplay("The packageManager field declares pnpm.")).toBe(
      "The packageManager field declares pnpm.",
    );
  });

  it("neutralizes ANSI escape sequences", () => {
    const malicious = `pnpm${ESC}[31mFAKE ERROR${ESC}[0m`;

    const result = sanitizeForDisplay(malicious);

    expect(result).not.toContain(ESC);
    expect(result).toBe("pnpm [31mFAKE ERROR [0m");
  });

  it("prevents embedded newlines from injecting fake report lines", () => {
    const malicious = `pnpm${LF}${ESC}[31m✗ Fake critical issue${ESC}[0m`;

    const result = sanitizeForDisplay(malicious);

    expect(result).not.toContain(LF);
    expect(result.split("\n")).toHaveLength(1);
  });

  it("neutralizes carriage returns", () => {
    expect(sanitizeForDisplay(`before${CR}after`)).toBe("before after");
  });

  it("preserves unicode text (accents, emoji)", () => {
    expect(sanitizeForDisplay("café 🎉 café")).toBe("café 🎉 café");
  });
});
