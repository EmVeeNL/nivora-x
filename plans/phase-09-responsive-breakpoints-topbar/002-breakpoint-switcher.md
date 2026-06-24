---
task: 002
phase: 09
title: Functional Breakpoint Switcher
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Functional Breakpoint Switcher

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Make the Phase 03 breakpoint switcher functional: populate it from the configured breakpoint
set and have the active breakpoint (UI state) drive the canvas width.

## Context

Phase 03 shipped a visual switcher bound to UI state with hard-coded presets. This task feeds
it the configured set (task 001) and connects the active breakpoint to the canvas frame width
(Phase 03 task 005) and to style resolution (task 003).

## Requirements (Test Description)

- **Test:** Given the configured breakpoints, the switcher renders one option per breakpoint
  (incl. custom).
- **Test:** Given a breakpoint selection, the active breakpoint updates in UI state.
- **Test:** Given an active breakpoint, the canvas frame resizes to its width.
- **Test:** Given breakpoints changing in settings, the switcher updates live.

## Acceptance Criteria

- [ ] Switcher populated from the configured breakpoint set (presets + custom).
- [ ] Active breakpoint in UI state drives the canvas width.
- [ ] Reacts to breakpoint-config changes.
- [ ] Vitest covers switcher↔width↔config; lint/format/typecheck pass.

## Files to Create

- (edit) `app/shell/BreakpointSwitcher.tsx` — bind to the configured set.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Replace the Phase 03 hard-coded preset list with the task-001 accessor (single source).
- Canvas width binding already exists (Phase 03 task 005) — point it at the configured widths.
