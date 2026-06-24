---
task: 005
phase: 10
title: Real Front-End Render (Replace Placeholder Switch)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 004]
retry_count: 0
---

# Task 005 — Real Front-End Render (Replace Placeholder Switch)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 004
> **Retry count:** 0

## Description

Replace the Phase 02 placeholder front-end `RenderSwitch` so that `nivorax`-mode posts render
via the real PHP renderer (task 002) with their enqueued generated CSS (task 004), while
default-mode posts remain untouched.

## Context

Phase 02 stubbed the front-end output behind a clear interface so the real renderer would be a
drop-in. This task makes NivoraX pages actually appear for visitors — the payoff of the whole
plan. Scoping and fail-safety from Phase 02 still apply.

## Requirements (Test Description)

- **Test:** Given a `nivorax`-mode post, the front end outputs the real rendered HTML + its
  generated CSS is enqueued.
- **Test:** Given a `default`-mode post, rendering is unchanged (native content).
- **Test:** Given an empty/malformed document, the front end fails safe (no fatal).
- **Test:** The render hook stays well-scoped (priority/conditions) and admin-safe.
- **Test:** Output passes PHPCS + PHPStan.

## Acceptance Criteria

- [ ] Placeholder render replaced by the real PHP renderer for `nivorax`-mode posts.
- [ ] Generated CSS enqueued for those posts (task 004).
- [ ] Default-mode posts untouched; fail-safe on bad data.
- [ ] Well-scoped, admin-safe hook (carried from Phase 02).
- [ ] Pest tests for both modes; PHPCS + PHPStan clean.

## Files to Create

- (edit) `src/FrontEnd/RenderSwitch.php` — swap placeholder for the real renderer + CSS enqueue.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 02 interface seam; this should be a focused swap, not a rewrite.
- Verify against a default theme for `the_content`/template conflicts.
