# Security Policy

## Supported versions

RepoCheckup is pre-1.0. Only the latest published `0.x` version is supported; please upgrade before reporting an issue.

## Reporting a vulnerability

Please report security issues privately using GitHub's private vulnerability reporting on this repository (Security tab → "Report a vulnerability") rather than filing a public issue.

Include, where possible:

- the RepoCheckup version and the command you ran;
- a minimal repository (or fixture) that reproduces the issue;
- what you expected versus what happened.

## What RepoCheckup does and does not do

RepoCheckup analyzes repositories locally and read-only:

- no account, no API key, no telemetry;
- no repository or source code upload;
- no network calls during a normal scan;
- no execution of the scanned repository's scripts or JavaScript/TypeScript configuration;
- filesystem reads are bounded and confined to the scanned repository (symlinks that escape it, or that form a cycle, are refused).

A clean RepoCheckup scan is a repository-hygiene signal, not a security guarantee. RepoCheckup is not a linter, a vulnerability scanner, a secret scanner, or a SAST tool.
