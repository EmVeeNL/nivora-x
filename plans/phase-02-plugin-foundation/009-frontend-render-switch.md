---
task: 009
phase: 02
title: Front-End Rendering Switch
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 005]
retry_count: 0
---

# Task 009 — Front-End Rendering Switch

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 005
> **Retry count:** 0

## Description

When a post's editor mode is `nivorax`, render the front end from the NivoraX layout meta
instead of `post_content`. In Phase 02 the actual element rendering doesn't exist yet, so
this outputs a **placeholder**; the real renderer arrives in the front-end batch (Phase 10).

## Context

This closes the coexistence loop: the mode flag (task 004) decides what visitors see, and
the layout data comes from the storage contract (task 005). The hook must be tightly
scoped so it only affects NivoraX-mode posts and leaves all other content (Gutenberg,
other plugins, themes) untouched.

## Requirements (Test Description)

- **Test:** Given a `nivorax`-mode post, the front end renders the NivoraX output
  (placeholder) instead of `post_content`.
- **Test:** Given a `default`-mode post, rendering is completely unchanged (native
  `post_content`).
- **Test:** Given an empty/malformed envelope on a `nivorax`-mode post, the front end
  fails safe (placeholder/empty, no fatal).
- **Test:** The render hook is scoped (correct priority/condition) and doesn't leak into
  non-NivoraX content or admin.

## Acceptance Criteria

- [ ] Front-end output switches to NivoraX (placeholder) for `nivorax`-mode posts only.
- [ ] Default-mode posts render natively, unchanged.
- [ ] Fail-safe on empty/malformed data.
- [ ] Hook is well-scoped (priority/conditions) and admin-safe.
- [ ] Passes PHPCS + PHPStan; covered by tests for both modes.

## Files to Create

- `src/FrontEnd/RenderSwitch.php` — mode-aware front-end render hook (placeholder output).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- This is the seam the Phase 10 PHP renderer plugs into — keep the placeholder behind a
  clear interface so swapping in the real renderer is a drop-in.
- Test against a default theme to confirm no `the_content` conflicts.
