---
task: 006
phase: 05
title: Tests & Polish
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003, 004, 005]
retry_count: 0
---

# Task 006 — Tests & Polish

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003, 004, 005
> **Retry count:** 0

## Description

Round out test coverage across the element system and canvas, and polish the rendering +
selection experience so it integrates cleanly with the Phase 03 shell.

## Context

With the registry, starter elements, renderer, selection, and overlay in place, this task
ensures the phase is solid and well-tested before drag-and-drop (Phase 06) builds on it.
Focus on integration behavior (render → select → overlay) and the reusable coordinate
mapping the next phase depends on.

## Requirements (Test Description)

- **Test:** Given an end-to-end flow (load tree → render → click element → overlay tracks),
  it behaves correctly under test.
- **Test:** Given nested structures, selection/overlay resolve to the right element at depth.
- **Test:** Given shell interactions (panel collapse, breakpoint width change), canvas
  rendering and overlays stay correct.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, and Vitest all pass.

## Acceptance Criteria

- [ ] Integration tests cover render → select → overlay across nesting and breakpoints.
- [ ] Selection/overlay behave correctly within the Phase 03 shell (collapse, width changes).
- [ ] Visual polish of canvas chrome, selection, and hover states.
- [ ] All JS gates green (lint/format/typecheck/build/test).

## Files to Create

- `app/canvas/__tests__/` — integration tests for render/select/overlay (as needed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Pay special attention to the `useFrameRect` mapping under scroll/resize — Phase 06 relies
  on it; leaving it well-tested here de-risks drag-and-drop.
- Keep structural styling restrained; the real look arrives with the styling phases.
