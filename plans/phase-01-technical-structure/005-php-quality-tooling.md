---
task: 005
phase: 01
title: PHP Quality Tooling (PHPCS + PHPStan)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004]
retry_count: 0
---

# Task 005 — PHP Quality Tooling (PHPCS + PHPStan)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004
> **Retry count:** 0

## Description

Add PHP code-quality tooling: PHPCS configured to the WordPress Coding Standards (with
auto-fix via phpcbf) and PHPStan for static analysis, both runnable through Composer
scripts and clean against the skeleton.

## Context

PHPCS enforces *style* (WordPress standard); PHPStan catches *bugs* PHPCS can't see.
Together they are the PHP quality gate that hooks (task 010) and CI (task 011) invoke.
Per project conventions, the renderer interfaces will require docblocks and we register
custom capabilities in `phpcs.xml` so WPCS doesn't flag them — set the ruleset up to
accommodate that now. Pin tool versions known to run on PHP 8.5.

## Requirements (Test Description)

- **Test:** Given the skeleton, `composer lint` (PHPCS) reports zero errors/warnings.
- **Test:** Given a deliberately mis-formatted PHP file, `composer lint` fails, and
  `composer lint:fix` (phpcbf) auto-corrects the fixable violations.
- **Test:** Given the skeleton, `composer analyse` (PHPStan) passes at the configured
  level with zero errors.
- **Test:** Given the rulesets, WordPress sniffs are active and the custom capability
  allow-list in `phpcs.xml` suppresses false positives for project capabilities.

## Acceptance Criteria

- [ ] Dev deps added via Composer: WordPress Coding Standards (+ PHPCS), PHPStan
      (with WordPress stubs), pinned to PHP 8.5-compatible versions.
- [ ] `phpcs.xml.dist` targets `nivorax.php`, `src/`, and tooling files; sets the WP
      standard, text-domain, min PHP/WP, and a custom-capability allow-list.
- [ ] `phpstan.neon.dist` configures paths, a chosen analysis level, and WordPress
      stubs/bootstrap.
- [ ] Composer scripts: `lint`, `lint:fix`, `analyse` (and a combined `qa`).
- [ ] All scripts pass cleanly against the task-004 skeleton.

## Files to Create

- `phpcs.xml.dist` — WordPress standard ruleset + custom capability allow-list.
- `phpstan.neon.dist` — PHPStan config (paths, level, WP stubs).
- (edit) `composer.json` — dev deps + `lint`/`lint:fix`/`analyse`/`qa` scripts.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Choose a realistic starting PHPStan level (e.g. 5–6) and ratchet up later rather than
  forcing max on day one.
- Register project capabilities in `phpcs.xml` via the WordPress
  `customCapabilities`/property mechanism so `WordPress.WP.Capabilities` stays quiet.
- Add `szepeviktor/phpstan-wordpress` (or equivalent stubs) so WP functions/constants
  are known to PHPStan.
- These scripts are the exact commands tasks 010 and 011 call — keep names stable.
