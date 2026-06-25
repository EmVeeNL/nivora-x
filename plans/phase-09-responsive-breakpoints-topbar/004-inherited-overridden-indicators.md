---
task: 004
phase: 09
title: Inherited / Overridden Indicators + Reset
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 004 — Inherited / Overridden Indicators + Reset

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Show, per style control, whether the current value is inherited (from a wider breakpoint) or
overridden at the active breakpoint, and provide a "reset to inherited" action.

## Context

Desktop-first editing is confusing without clear inheritance cues. Each control needs to
signal its state at the active breakpoint and let users drop an override to fall back —
this is a project-standard UX expectation for responsive builders.

## Requirements (Test Description)

- **Test:** Given a control inheriting from a wider breakpoint, it shows an "inherited"
  indicator.
- **Test:** Given a control overridden at the active breakpoint, it shows an "overridden"
  indicator.
- **Test:** Given "reset to inherited", the active-breakpoint override is removed and the
  value falls back (canvas updates).
- **Test:** Indicators update as the active breakpoint changes.

## Acceptance Criteria

- [ ] Per-control inherited vs overridden indicator at the active breakpoint.
- [ ] "Reset to inherited" removes the active-breakpoint override.
- [ ] Indicators react to breakpoint switching.
- [ ] Undoable via store history.
- [ ] Vitest covers indicator state + reset; lint/format/typecheck pass.

## Files to Create

- `app/inspector/controls/ResponsiveControlAdornment.tsx` — indicator + reset affordance.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Derive indicator state from the resolver (task 003): is there an override at the active
  breakpoint, or is the value inherited?
- Make "reset" a single undo entry.
- Completed on 2026-06-25 with a dedicated responsive adornment component showing per-control
  inherited vs overridden state and an explicit reset-to-inherited action.
