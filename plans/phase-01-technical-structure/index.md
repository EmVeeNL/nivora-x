---
phase: 01
slug: technical-structure
title: Technical Structure
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 01 — Technical Structure

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Stand up a reproducible, fully-tooled development foundation for the NivoraX plugin:
a Dockerized WordPress environment, version control with Gitflow + Conventional
Commits, the complete PHP and JS/TS toolchains (lint, format, static analysis, test),
and automated checks on every commit (local hooks) and push (CI). At the end of this
phase, a contributor can clone, run one command, and have a working WordPress with the
plugin installed and all quality gates green — without writing any product code yet.

## Scope

- Dockerized local environment: WordPress (Apache), MariaDB, Mailhog.
- Custom Dockerfile `FROM wordpress:7.0.0-php8.5-apache` adding Xdebug + WP-CLI.
- Scripted WordPress install & configuration via WP-CLI (idempotent, repeatable).
- Git foundation: Gitflow branch model, `.gitignore`, `.editorconfig`, `.nvmrc`,
  GPLv2+ `LICENSE`, `README`.
- PHP toolchain: Composer (PSR-4 autoload), PHPCS (WordPress standard), PHPStan.
- JS/TS toolchain: pnpm, Vite, TypeScript, ESLint, Prettier.
- Testing: Pest/PHPUnit (with Xdebug coverage), Vitest, Playwright.
- Vite ↔ WordPress asset integration (manifest-based enqueue + dev HMR).
- Commit enforcement: husky + lint-staged + commitlint.
- CI: GitHub Actions running build + lint + static analysis + tests.
- A minimal, valid plugin skeleton to anchor the toolchain (no product features).

## Out of Scope

- The node-tree data model, editor app, renderers, or any builder features
  (later phases).
- Production build/release & WordPress.org packaging (later phase).
- Auth, roles/capabilities design beyond what WP-CLI setup needs (later phase).
- Database schema / custom tables for the builder (later phase).

## Success Criteria

- [ ] `docker compose up` yields a reachable WordPress at a documented URL, with
      MariaDB and Mailhog running; outgoing mail is captured by Mailhog.
- [ ] A single documented command provisions WordPress end-to-end via WP-CLI and is
      safe to re-run (idempotent).
- [ ] The plugin skeleton activates cleanly with zero PHP notices/warnings.
- [ ] `composer` scripts run PHPCS + PHPStan with zero errors on the skeleton.
- [ ] `pnpm` scripts run ESLint + Prettier (check) + `tsc` with zero errors.
- [ ] Pest/PHPUnit, Vitest, and Playwright each run a passing example test, with PHP
      coverage produced via Xdebug.
- [ ] Vite builds editor assets; WordPress enqueues them from the manifest; dev HMR
      works inside WP.
- [ ] A non-conventional commit message is rejected locally; staged files are linted
      via lint-staged on commit.
- [ ] GitHub Actions runs build + lint + static analysis + tests on push/PR and is
      green.
- [ ] `README` documents setup, daily commands, and the Gitflow + Conventional Commit
      conventions.

## Task Overview

| Task | Description                                                        | Depends On | Status      |
| ---- | ------------------------------------------------------------------ | ---------- | ----------- |
| 001  | Repository & Git foundation (Gitflow, gitignore, editorconfig, nvmrc, LICENSE, README skeleton) | —          | Done        |
| 002  | Docker environment (custom WP Dockerfile + Xdebug/WP-CLI, MariaDB, Mailhog, compose, .env) | 001        | Done        |
| 003  | WordPress provisioning via WP-CLI (idempotent setup script, Mailhog SMTP, Query Monitor) | 002        | Done        |
| 004  | Minimal plugin skeleton (main file, header, Composer PSR-4 autoload, activation hooks) | 001        | Done        |
| 005  | PHP quality tooling (Composer scripts, PHPCS WordPress standard, PHPStan)             | 004        | Done        |
| 006  | PHP testing (Pest/PHPUnit harness, Xdebug coverage, example test)                     | 004, 005   | Done        |
| 007  | JS/TS toolchain (pnpm, Vite, TypeScript, ESLint, Prettier)                            | 001        | Done        |
| 008  | Vite ↔ WordPress integration (manifest enqueue + dev HMR)                             | 004, 007   | Done        |
| 009  | JS testing (Vitest unit + Playwright E2E, example tests)                              | 007, 008   | Done        |
| 010  | Commit enforcement (husky, lint-staged, commitlint)                                   | 005, 007   | Done        |
| 011  | CI pipeline (GitHub Actions: build + lint + static analysis + tests)                  | 006, 009, 010 | Done     |
| 012  | README & developer docs (setup, commands, conventions) finalized                      | 011        | Done        |

## Architectural Notes

- **Monorepo-friendly layout.** Plugin PHP and the JS editor app live in one repo. Keep
  PHP under a `src/` (PSR-4) and JS under an `app/` (or `src-js/`) so the two toolchains
  don't collide; the exact paths are fixed in task 004/007.
- **Idempotent provisioning.** The WP-CLI setup script must be safe to run repeatedly —
  check-before-create for the install, admin user, options, and plugin activation.
- **Two enqueue modes.** Vite dev (HMR via the dev server) vs production (hashed assets
  read from `manifest.json`). The plugin must detect which mode and enqueue accordingly.
- **Xdebug off by default.** Enable Xdebug via env toggle so normal runs stay fast;
  coverage/debug sessions opt in.
- **CI mirrors local.** GitHub Actions should call the same Composer/pnpm scripts the
  hooks use, so "green locally" and "green in CI" mean the same thing.
- **Conventional Commits + Gitflow** are enforced mechanically (commitlint) and
  documented (README), not left to discipline.

## Risks & Mitigations

| Risk                                                              | Impact | Likelihood | Mitigation                                                                 |
| ---------------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------- |
| Vite ↔ WP enqueue/HMR integration is fiddly and time-consuming   | M      | H          | Isolate in task 008; start from a known WP+Vite manifest pattern; keep dev/prod detection explicit and tested. |
| PHP 8.5 / WP 7.0 incompatibilities in tooling (PHPCS/PHPStan/Pest)| M      | M          | Pin tool versions known to support PHP 8.5; lock via Composer; verify in CI early. |
| WP-CLI provisioning not idempotent → flaky re-runs               | M      | M          | Check-before-create throughout; add a `--fresh` path that resets volumes.  |
| Docker volume/permission mismatches (Apache user vs host)         | M      | M          | Document UID/GID handling; mount plugin dir read-write with correct owner. |
| Toolchain sprawl slows onboarding                                 | L      | M          | One `README` "quickstart" + a small set of top-level scripts as entrypoints. |
