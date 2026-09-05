# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-09-05

### Added

- A Project check for a missing `engines.node` field in `package.json`.

## [0.1.2] - 2026-09-05

### Fixed

- Automated npm publishing via GitHub Releases, which never worked (the CI workflow was silently broken).

## [0.1.1] - 2026-09-04

### Fixed

- `npx repo-checkup` (and any invocation through npm's `bin` symlink) produced no output at all. The entry-point check compared `import.meta.url` to `process.argv[1]` as plain strings, which breaks whenever the file is reached through a symlink or an OS-normalized path (e.g. macOS resolving `/tmp` to `/private/tmp`). The comparison now resolves both sides with `realpathSync` first.

## [0.1.0] - 2026-09-04

### Added

- Initial public release: repository context detection, project profile detection, package manager detection, and checks across six categories (Project, TypeScript, Tooling, Testing, CI, Repository).
- Terminal and JSON reporters, health scoring, `--json`, `--ci`, `--category`, `--verbose`, `--no-score` flags.
- GitHub Actions workflow analysis with cross-file reasoning (e.g. detecting when configured tests never run in CI).

[0.1.3]: https://github.com/Randy-R-code/repo-checkup/releases/tag/v0.1.3
[0.1.2]: https://github.com/Randy-R-code/repo-checkup/releases/tag/v0.1.2
[0.1.1]: https://github.com/Randy-R-code/repo-checkup/releases/tag/v0.1.1
[0.1.0]: https://github.com/Randy-R-code/repo-checkup/releases/tag/v0.1.0
