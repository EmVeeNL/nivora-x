---
task: 003
phase: 03
title: Top Toolbar
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 003 — Top Toolbar

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Build the top toolbar: project/page title (left), device/breakpoint switcher (center), and
Preview + Publish buttons (right). The breakpoint switcher is wired to UI state; the action
buttons are visual placeholders this phase.

## Context

Matches the reference toolbar. The breakpoint switcher sets the active breakpoint in the
UI store (task 002), which the canvas (task 005) reads to size itself. Save/Preview/Publish
become functional in the editor batch (Phase 09); here they're styled, non-functional
controls.

## Requirements (Test Description)

- **Test:** Given the toolbar, it renders title (left), breakpoint switcher (center), and
  Preview/Publish (right) matching the reference arrangement.
- **Test:** Given the breakpoint switcher, selecting a device updates the active breakpoint
  in UI state.
- **Test:** Given the active breakpoint, the switcher reflects the current selection.
- **Test:** Preview/Publish render as buttons but perform no action (visual only).

## Acceptance Criteria

- [x] Toolbar with the three regions laid out per the reference.
- [x] Device/breakpoint switcher bound to UI state (desktop/tablet/mobile presets).
- [x] Preview + Publish buttons present, styled, non-functional.
- [x] Vitest covers the switcher↔state binding; lint/format/typecheck pass.

## Files to Create

- `app/shell/TopToolbar.tsx` — toolbar layout + controls.
- `app/shell/BreakpointSwitcher.tsx` — device/breakpoint control bound to UI state.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the breakpoint preset list in one place; Phase 09 makes it configurable + adds
  custom breakpoints, so don't hard-code it across components.
- Reserve space for the autosave indicator (Phase 09) so adding it later causes no layout
  shift.
