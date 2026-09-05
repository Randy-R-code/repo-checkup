# Contributing

Thanks for considering a contribution to RepoCheckup.

## Setup

```bash
git clone https://github.com/Randy-R-code/repo-checkup.git
cd repo-checkup
pnpm install
```

## Workflow

```bash
pnpm dev         # run the CLI from source against a target path
pnpm typecheck
pnpm test
pnpm build
```

Run `pnpm typecheck` and `pnpm test` before opening a pull request — both also run in CI on every push and pull request.

## Adding a check

Checks live under `src/checks/<category>/` and are grouped by category (project, typescript, tooling, testing, ci, repository). Each check should:

- only run when it's actually applicable to the detected project (see `src/detectors/`);
- use careful, evidence-based language in its message ("detected", "appears") rather than absolute claims;
- come with a fixture and a test under `tests/` and `fixtures/` reproducing both the passing and failing case.

## Reporting bugs

Open a GitHub issue with the RepoCheckup version, the command you ran, and — where possible — a minimal repository or fixture that reproduces the problem.

## Reporting security issues

Do not open a public issue. See [SECURITY.md](SECURITY.md) for how to report a vulnerability privately.

## Pull requests

Keep pull requests focused on a single change. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`, ...).
