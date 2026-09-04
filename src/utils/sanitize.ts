const UNSAFE_CHARACTER_CODES = [
  ...Array.from({ length: 0x20 }, (_, code) => code),
  ...Array.from({ length: 0x21 }, (_, index) => 0x7f + index),
];

const UNSAFE_CHARACTERS = new RegExp(
  `[${UNSAFE_CHARACTER_CODES.map((code) => `\\u${code.toString(16).padStart(4, "0")}`).join("")}]`,
  "g",
);

/**
 * Strips control characters (including ANSI escapes and embedded newlines)
 * from a string before it reaches terminal output. Check messages and
 * recommendations sometimes interpolate values read from the scanned
 * repository (e.g. a raw packageManager field); those values must never be
 * able to inject ANSI sequences or fake extra lines into the report.
 */
export function sanitizeForDisplay(value: string): string {
  return value.replace(UNSAFE_CHARACTERS, " ").trim();
}
