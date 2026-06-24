---
task: 010
phase: 01
title: Commit Enforcement (husky, lint-staged, commitlint)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [005, 007]
retry_count: 0
---

# Task 010 — Commit Enforcement (husky, lint-staged, commitlint)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 005, 007
> **Retry count:** 0

## Description

Wire local Git hooks so quality and commit conventions are enforced automatically:
husky runs lint-staged on `pre-commit` (PHP + JS linters/formatters on staged files)
and commitlint on `commit-msg` (Conventional Commits).

## Context

`AGENTS.md` mandates Conventional Commits and "build/checks after each commit." This task
delivers the *local* half (CI is task 011). lint-staged keeps commits fast by only
touching staged files — running Prettier/ESLint on staged JS/TS and phpcbf/PHPCS on
staged PHP. commitlint rejects non-conforming messages before they're recorded. This
depends on the PHP scripts (005) and JS scripts (007) already existing.

## Requirements (Test Description)

- **Test:** Given a staged JS/TS file with a fixable format issue, committing auto-fixes
  it (or blocks if unfixable) via lint-staged.
- **Test:** Given a staged PHP file violating WPCS, committing runs phpcbf/PHPCS and
  blocks on unfixable violations.
- **Test:** Given a commit message `bad message`, the `commit-msg` hook rejects it.
- **Test:** Given a commit message `feat(editor): add mount node`, the hook accepts it.
- **Test:** Given a fresh clone, hooks install automatically (e.g. via the prepare
  script) so contributors don't have to wire them manually.

## Acceptance Criteria

- [ ] husky installed and hooks auto-installed on `pnpm install` (prepare script).
- [ ] `pre-commit` runs lint-staged.
- [ ] lint-staged config: JS/TS → ESLint (+ Prettier); PHP → phpcbf then PHPCS.
- [ ] `commit-msg` runs commitlint with the conventional config.
- [ ] Non-conforming commit messages and unfixable lint errors both block the commit.
- [ ] Documented escape hatch (`--no-verify`) noted for emergencies.

## Files to Create

- `.husky/pre-commit` — runs lint-staged.
- `.husky/commit-msg` — runs commitlint.
- `commitlint.config.js` — extends conventional config.
- `.lintstagedrc.json` (or `package.json` field) — staged-file linters per filetype.
- (edit) `package.json` — husky `prepare` script + dev deps.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- PHP linters in lint-staged must call the same PHPCS/phpcbf config from task 005 so
  local and CI verdicts match. Run them via the container if PHP isn't on the host.
- Keep `pre-commit` fast (staged-only); leave full test suites to `pre-push`/CI to avoid
  painful commit latency. Consider a light `pre-push` hook for `typecheck`.
- Align commitlint's allowed types with the list documented in README (task 012).
