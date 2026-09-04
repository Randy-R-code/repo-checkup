import { describe, expect, it } from "vitest";
import { detectProjectProfile } from "../../src/detectors/profile.js";
import type { PackageJson } from "../../src/parsers/package-json.js";

function createPackageJson(overrides: Partial<PackageJson> = {}): PackageJson {
  return {
    name: undefined,
    version: undefined,
    private: undefined,
    type: undefined,
    main: undefined,
    bin: undefined,
    exports: undefined,
    scripts: {},
    dependencies: {},
    devDependencies: {},
    ...overrides,
  };
}

describe("detectProjectProfile", () => {
  it("detects a Next.js application", () => {
    expect(detectProjectProfile({ next: "^15.0.0" }, createPackageJson())).toBe(
      "nextjs",
    );
  });

  it("detects a TanStack Start application", () => {
    expect(
      detectProjectProfile(
        { "@tanstack/react-start": "^1.0.0" },
        createPackageJson(),
      ),
    ).toBe("tanstack-start");
  });

  it("detects a React + Vite application", () => {
    expect(
      detectProjectProfile(
        { vite: "^5.0.0", react: "^18.0.0" },
        createPackageJson(),
      ),
    ).toBe("vite-react");
  });

  it("does not detect vite-react without React", () => {
    expect(detectProjectProfile({ vite: "^5.0.0" }, createPackageJson())).toBe(
      "generic",
    );
  });

  it("detects a Node.js CLI from the bin field", () => {
    const packageJson = createPackageJson({
      bin: { "my-cli": "./dist/cli.js" },
    });

    expect(detectProjectProfile({}, packageJson)).toBe("node-cli");
  });

  it("detects a Node.js backend from a known framework dependency", () => {
    expect(
      detectProjectProfile({ express: "^4.0.0" }, createPackageJson()),
    ).toBe("node-backend");
  });

  it("detects a publishable npm library", () => {
    const packageJson = createPackageJson({ main: "./index.js" });

    expect(detectProjectProfile({}, packageJson)).toBe("npm-library");
  });

  it("does not detect a private package as an npm library", () => {
    const packageJson = createPackageJson({
      main: "./index.js",
      private: true,
    });

    expect(detectProjectProfile({}, packageJson)).toBe("generic");
  });

  it("falls back to generic when no evidence matches", () => {
    expect(detectProjectProfile({}, createPackageJson())).toBe("generic");
  });

  it("prioritizes Next.js over other signals", () => {
    const packageJson = createPackageJson({ bin: { x: "./x.js" } });

    expect(
      detectProjectProfile({ next: "^15.0.0", vite: "^5.0.0" }, packageJson),
    ).toBe("nextjs");
  });
});
