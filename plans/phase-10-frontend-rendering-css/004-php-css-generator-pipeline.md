---
task: 004
phase: 10
title: PHP CSS Generator & Generate-on-Save Pipeline
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 004 — PHP CSS Generator & Generate-on-Save Pipeline

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Implement the **PHP CSS generator** (matching the task-003 rules) and the generate-on-save
pipeline: on document save/publish, generate the CSS, store it (file in uploads; meta
fallback), and enqueue it on the front end — with versioned invalidation on token/breakpoint
changes.

## Context

This is the front-end half of the CSS engine. It must produce output equal to the JS
generator (verified by fixtures in task 007). Generating on save (not per request) keeps page
loads fast, mirroring Elementor.

## Requirements (Test Description)

- **Test:** Given a document, the PHP generator emits CSS identical to the JS generator for
  shared fixtures.
- **Test:** Given a save/publish, CSS is generated and stored; the stored artifact is found
  and enqueued on the front end.
- **Test:** Given a token/breakpoint change, affected CSS is regenerated/invalidated.
- **Test:** Given a missing/failed generation, the front end fails safe (no fatal).
- **Test:** Storage + enqueue + generation pass PHPCS + PHPStan.

## Acceptance Criteria

- [ ] PHP CSS generator matching the task-003 rules (fixture-verified in 007).
- [ ] Generate-on-save hook tied to Phase 04 persistence.
- [ ] Storage (uploads file; meta fallback) + conditional front-end enqueue.
- [ ] Versioned invalidation on token/breakpoint changes.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Css/CssGenerator.php` — PHP CSS generator.
- `src/Css/CssStore.php` — store/retrieve generated CSS (file/meta).
- `src/Css/CssPipeline.php` — generate-on-save + enqueue + invalidation.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Follow `app/css/rules.ts` (task 003) exactly; divergence is caught by task 007 fixtures.
- Version the artifact by document + tokens + breakpoints so caches invalidate correctly.
- Enqueue only for `nivorax`-mode posts (coordinate with task 005).
