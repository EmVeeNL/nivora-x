---
task: 009
phase: 01
title: JS Testing (Vitest + Playwright)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [007, 008]
retry_count: 0
---

# Task 009 — JS Testing (Vitest + Playwright)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 007, 008
> **Retry count:** 0

## Description

Set up JavaScript testing: Vitest for unit/component tests and Playwright for end-to-end
tests against the Dockerized WordPress, each with a passing example and a runnable script.

## Context

Vitest mirrors the Vite config so unit tests share the app's resolution/transforms;
Playwright drives a real browser against the running WP (task 002/003) to prove the
editor admin page (task 008) actually loads in the product. These suites are part of the
quality gate that hooks (010) and CI (011) enforce. Keep examples minimal — a green,
reproducible harness is the goal.

## Requirements (Test Description)

- **Test:** Given the harness, `pnpm test:unit` (Vitest) runs and an example unit test
  passes; a deliberately failing test makes it exit non-zero.
- **Test:** Given a component test, rendering a trivial React component asserts on its
  output (jsdom/Testing Library).
- **Test:** Given the running Docker WP, `pnpm test:e2e` (Playwright) loads the editor
  admin page and asserts the mount node / bundle is present.
- **Test:** Given Playwright config, it can target the documented WP URL via env so CI
  and local use the same spec.

## Acceptance Criteria

- [ ] Vitest configured (sharing Vite resolve/transform), with jsdom + Testing Library
      for component tests.
- [ ] Playwright configured with the WP base URL from env, browsers installed, and a
      sensible timeout/retry policy.
- [ ] Example unit test, example component test, and example E2E spec — all green.
- [ ] Scripts: `test:unit`, `test:unit:watch`, `test:e2e` (and a `test` that runs unit).
- [ ] E2E spec asserts the task-008 editor admin page loads.

## Files to Create

- `vitest.config.ts` — Vitest config (jsdom, setup file).
- `app/__tests__/example.test.ts` — unit example.
- `app/__tests__/Example.component.test.tsx` — component example.
- `playwright.config.ts` — E2E config (base URL from env).
- `e2e/editor-page.spec.ts` — loads the editor admin page.
- (edit) `package.json` — test scripts.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Playwright E2E needs the stack up *and* provisioned (tasks 002/003) and a logged-in
  admin to reach the editor page — script a storage-state/auth setup so specs aren't
  flaky.
- Keep unit (Vitest) and E2E (Playwright) clearly separated; don't let Playwright specs
  get picked up by Vitest (exclude `e2e/`).
- In CI (task 011), Playwright runs after the Docker stack is provisioned — coordinate
  the base URL env var name now and reuse it there.
