---
task: 006
phase: 01
title: PHP Testing (Pest/PHPUnit + Coverage)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 005]
retry_count: 0
---

# Task 006 — PHP Testing (Pest/PHPUnit + Coverage)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 005
> **Retry count:** 0

## Description

Set up the PHP testing harness (Pest on PHPUnit) with a working example test and
Xdebug-driven code coverage, runnable via a Composer script.

## Context

This establishes the TDD workflow used by every later PHP task: tasks describe their
tests first, and those tests run here. We need both fast unit tests (no WordPress
bootstrap) and the option of WordPress-integration tests against the loaded plugin.
Coverage is produced via the Xdebug installed in task 002 (enabled through its env
toggle for coverage runs). Keep the example minimal — the goal is a green, reproducible
harness, not real coverage.

## Requirements (Test Description)

- **Test:** Given the harness, `composer test` runs the suite and an example unit test
  passes.
- **Test:** Given the Xdebug coverage toggle enabled, `composer test:coverage` produces
  a coverage report (text + machine-readable e.g. Clover/Cobertura for CI).
- **Test:** Given a WordPress-integration test, the plugin bootstraps under the test
  WP environment and a basic assertion against an activation side-effect passes.
- **Test:** Given a deliberately failing test, `composer test` exits non-zero (proves
  the gate actually fails builds).

## Acceptance Criteria

- [ ] Dev deps: Pest (+ PHPUnit), and a WP test approach (wp-phpunit / Brain Monkey or
      Yoast WP test utils) chosen and documented.
- [ ] `phpunit.xml.dist` (or Pest config) defines unit and integration suites, paths,
      and coverage settings.
- [ ] `tests/` with bootstrap, a unit example, and an integration example.
- [ ] Composer scripts: `test`, `test:coverage` (and a `qa` that chains lint+analyse+test).
- [ ] Coverage report generated via Xdebug in a CI-consumable format.
- [ ] Suite is green against the task-004 skeleton.

## Files to Create

- `phpunit.xml.dist` — suites + coverage config.
- `tests/bootstrap.php` — autoload + (optional) WP test bootstrap.
- `tests/Unit/ExampleTest.php` — passing unit example.
- `tests/Integration/PluginActivationTest.php` — WP-integration example.
- `tests/Pest.php` — Pest bootstrap/helpers (if using Pest).
- (edit) `composer.json` — test deps + `test`/`test:coverage` scripts.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Decide early: lightweight WP mocking (Brain Monkey) for unit tests vs a full WP test
  install for integration. Likely both — keep them in separate suites so unit stays fast.
- Coverage driver: ensure the Xdebug env toggle (task 002) is on for coverage runs only.
- Integration tests need a test DB — reuse the Docker `db` service or a throwaway one;
  document the command so CI (task 011) can replicate it.
