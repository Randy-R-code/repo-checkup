# RepoCheckup

> Give your JavaScript or TypeScript repository a quick checkup.

RepoCheckup is a zero-config CLI that checks JavaScript and TypeScript repositories for configuration, tooling, testing, CI, and project health. It doesn't replace ESLint, TypeScript, or your test runner — it looks at how they're wired together and points out what an experienced reviewer would notice on a first pass.

## Quick start

RepoCheckup isn't published on npm yet. The intended usage once it is:

```bash
npx repo-checkup
```

Until then, run it from source:

```bash
git clone <repository-url>
cd repo-checkup
pnpm install
pnpm build
node dist/cli.js /path/to/your/project
```

## Example output

```text
RepoCheckup

Checking /path/to/your-project...

Detected
Node.js CLI · TypeScript · pnpm · Vitest

Project        4/4
TypeScript     5/5
Tooling        1/1
Testing        3/3
CI             0/1
Repository     3/3

Issues

! GitHub Actions workflows are present
  No GitHub Actions workflow was found under .github/workflows.

  Recommendation:
  Add a workflow that installs dependencies and runs lint, typecheck, tests, and build.

Summary
✓ 16 passed  ! 1 recommendations  ✗ 0 issues

Health 97/100
```

## What it checks

Checks are grouped into six categories. Every check only runs when it's actually applicable to the detected project (for example, TypeScript checks are skipped entirely for a plain JavaScript repository).

- **Project** — `package.json` validity, package manager detection, conflicting lockfiles, `packageManager` field consistency.
- **TypeScript** — `tsconfig.json` presence and validity, strict mode, the `typescript` package being installed, a typecheck script.
- **Tooling** — ESLint / Biome / Prettier installed-vs-configured consistency, overlapping linters.
- **Testing** — a test runner detected, a `test` script, actual test files, end-to-end tests when an e2e tool is installed.
- **CI** — GitHub Actions workflows present, pull-request validation, and whether tests/typecheck/build actually run in CI (not just configured locally).
- **Repository** — README, LICENSE, `.gitignore`, and whether a `.env` file is safely excluded from version control.

RepoCheckup favors cross-file reasoning over single-file checks. The flagship example: Vitest is installed, test files exist, GitHub Actions is set up — but no workflow step runs the test script. That's a real finding a `.eslintrc` or `test` script alone can't surface.

## Detected project types

Detection is evidence-based (dependencies, scripts, config files, package metadata) rather than filename matching:

Next.js · React + Vite · TanStack Start · Node.js backend · Node.js CLI · npm library · Generic JS/TS repository

## CLI options

```bash
repo-checkup [path]              # defaults to the current directory
repo-checkup --json              # machine-readable output on stdout
repo-checkup --ci                # exit code 1 if any check reports an error
repo-checkup --category <name>   # project, typescript, tooling, testing, ci, repository
repo-checkup --verbose           # list every check result, not just issues
repo-checkup --no-score          # hide the Health line
repo-checkup --help
repo-checkup --version
```

## Scoring

The score is a summary, not the product — the useful output is the list of findings and recommendations. Each check has a weight (1–5): passing checks earn full weight, warnings earn half, errors earn none, and only applicable checks count toward the total. High-impact issues (a broken CI setup, an untracked `.env` risk) weigh more than documentation niceties.

## CI usage

```yaml
- name: RepoCheckup
  run: npx repo-checkup --ci
```

`--ci` makes exit codes deterministic: `0` when no check reports an error, `1` when at least one does, `2` if RepoCheckup itself couldn't run (invalid path, unreadable repository). Findings never get conflated with a CLI crash. Without `--ci`, interactive runs always exit `0` so casual local use doesn't fail your shell.

## JSON output

`--json` prints valid JSON to stdout only (diagnostics go to stderr):

```json
{
  "version": "0.1.0",
  "target": "/path/to/your-project",
  "context": {
    "profile": "node-cli",
    "language": "typescript",
    "packageManager": "pnpm",
    "tools": ["vitest"]
  },
  "summary": {
    "score": 50,
    "passed": 0,
    "warnings": 1,
    "errors": 0
  },
  "results": [
    {
      "id": "ci/workflows-found",
      "category": "ci",
      "status": "warning",
      "title": "GitHub Actions workflows are present",
      "message": "No GitHub Actions workflow was found under .github/workflows.",
      "recommendation": "Add a workflow that installs dependencies and runs lint, typecheck, tests, and build."
    }
  ]
}
```

## Privacy

RepoCheckup runs entirely locally: no account, no API key, no telemetry, no repository or source upload, no network calls during a normal scan. It never executes your project's scripts or arbitrary config files — only static files (`package.json`, `tsconfig.json`, GitHub Actions YAML, etc.) are read and parsed.

## Limitations

RepoCheckup is not a linter, a vulnerability scanner, a secret scanner, or a SAST tool, and it doesn't replace ESLint/Biome, TypeScript, or your CI provider — it checks whether the tools you already have are coherently wired together. Findings use careful language ("detected", "appears") rather than absolute claims, and a clean scan is not a security guarantee.

## Development

```bash
pnpm install
pnpm dev         # run the CLI from source
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT
