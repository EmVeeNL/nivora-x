---
task: 001
phase: 01
title: Repository & Git Foundation
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Repository & Git Foundation

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Initialize the Git repository with the Gitflow branch model and the shared,
language-agnostic project files (ignore rules, editor config, Node version pin,
license, README skeleton) that every later task builds on.

## Context

This is the root of the whole project; nothing else can land until version control and
the baseline conventions exist. Gitflow (`main` ← `develop` ← `feature/*`,
`release/*`, `hotfix/*`) and Conventional Commits are the agreed workflow — see
`AGENTS.md`. Actual commit-message *enforcement* is wired later in task 010; here we
only establish the structure and document the conventions. The plugin is distributed
under the WordPress-required GPLv2-or-later license.

## Requirements (Test Description)

- **Test:** Given a fresh clone, `git rev-parse --abbrev-ref HEAD` resolves and both
  `main` and `develop` branches exist, with `develop` based on `main`.
- **Test:** Given the repo, `.gitignore` excludes `vendor/`, `node_modules/`,
  build output, `.env`, and OS/editor cruft — none of these appear in `git status`
  after a typical install.
- **Test:** Given `.editorconfig`, an editor honoring it applies the project's
  indentation/newline rules (UTF-8, LF, final newline, trimmed trailing whitespace).
- **Test:** Given `.nvmrc`, `node -v` after `nvm use` matches the version the JS
  toolchain (task 007) declares in `engines`.
- **Test:** Given `LICENSE`, it is the GPLv2-or-later text and the project name/year
  are present.

## Acceptance Criteria

- [ ] Repo initialized; `main` and `develop` branches exist (`develop` off `main`).
- [ ] `.gitignore` covers PHP (`vendor/`), JS (`node_modules/`, build dirs), `.env`,
      coverage/reports, and macOS/editor files.
- [ ] `.editorconfig` present with UTF-8, LF, final newline, trim trailing whitespace,
      and per-filetype indent rules (PHP 4-space tabs per WP, JS/TS 2-space).
- [ ] `.nvmrc` pins the Node LTS version used by the JS toolchain.
- [ ] `LICENSE` is GPLv2-or-later.
- [ ] `README.md` skeleton exists with project name, one-line description, and a
      "Setup (WIP)" placeholder (filled in task 012).
- [ ] `.gitattributes` normalizes line endings (`* text=auto`).

## Files to Create

- `.gitignore` — ignore rules for PHP, JS, env, build/coverage, OS/editor.
- `.editorconfig` — shared editor formatting rules.
- `.nvmrc` — pinned Node version.
- `.gitattributes` — line-ending normalization.
- `LICENSE` — GPLv2-or-later.
- `README.md` — skeleton (expanded in task 012).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- WordPress core uses real tabs for PHP indentation; reflect that in `.editorconfig`
  (`indent_style = tab` for `*.php`) to stay consistent with PHPCS (task 005).
- Keep `develop` as the default working branch; `main` holds released code only.
- Conventional Commit *types* to document in README later: `feat, fix, docs, style,
  refactor, perf, test, build, ci, chore, revert`.
