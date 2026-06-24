---
task: 011
phase: 01
title: CI Pipeline (GitHub Actions)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [006, 009, 010]
retry_count: 0
---

# Task 011 — CI Pipeline (GitHub Actions)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 006, 009, 010
> **Retry count:** 0

## Description

Add a GitHub Actions workflow that, on push and pull request, runs the full quality gate:
PHP lint + static analysis + tests, JS lint + typecheck + build + unit tests, and
Playwright E2E against the provisioned Docker stack.

## Context

CI is the authoritative, machine-independent half of "checks after each commit"; the
local hooks (task 010) are the fast first line. CI must call the **same** Composer/pnpm
scripts the hooks use, so "green locally" and "green in CI" mean the same thing. E2E
requires standing up the Docker stack (002) and provisioning WordPress (003) inside the
runner before Playwright (009) runs.

## Requirements (Test Description)

- **Test:** Given a push/PR, the workflow triggers and runs to completion.
- **Test:** The PHP job runs `composer qa` (PHPCS + PHPStan + Pest) and fails on any
  violation/test failure.
- **Test:** The JS job runs `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
  `pnpm test:unit`, failing on any error.
- **Test:** The E2E job builds + provisions the Docker stack, then runs Playwright
  against the documented WP URL; failures fail the job.
- **Test:** A red check (failing test) blocks the PR's status; an all-green run passes.
- **Test:** Dependencies (Composer, pnpm store) are cached so reruns are faster.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` triggers on `push` and `pull_request`.
- [ ] PHP job: setup PHP 8.5, Composer install (cached), `composer qa`, upload coverage.
- [ ] JS job: setup Node from `.nvmrc`, pnpm install (cached), lint + typecheck + build +
      unit tests.
- [ ] E2E job: build + start + provision the Docker stack, install Playwright browsers,
      run E2E, upload report/artifacts on failure.
- [ ] Jobs reuse the same scripts as local hooks (no divergent commands).
- [ ] Workflow is lint-clean (e.g. passes actionlint) and green on `develop`.

## Files to Create

- `.github/workflows/ci.yml` — PHP / JS / E2E jobs with caching + artifacts.
- (optional) `.github/actions/` — composite action(s) if setup is reused across jobs.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse `docker compose` from task 002 and `bin/setup.sh` from task 003 verbatim in the
  E2E job — don't re-implement provisioning in YAML.
- Pass the WP base URL and admin creds to Playwright via the same env var names task 009
  uses locally.
- Gate merges into `develop`/`main` on this workflow (branch protection) — note it in
  README; the actual GitHub setting is configured outside the repo.
- Keep jobs parallel where possible (PHP and JS are independent of E2E build time).
