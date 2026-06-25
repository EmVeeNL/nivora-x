---
task: 006
phase: 09
title: Top Bar — Autosave Indicator (No Layout Shift)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 006 — Top Bar — Autosave Indicator (No Layout Shift)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** []
> **Retry count:** 0

## Description

Render the autosave status indicator in the top bar, driven by the Phase 04 autosave status
signal (idle / saving / saved / error), in a way that causes **no layout shift**.

## Context

Phase 04 emits the autosave status signal; Phase 03 reserved space in the toolbar for this
indicator. This task renders it in that reserved slot using fixed sizing + opacity/text
transitions so the surrounding toolbar never reflows as the status changes.

## Requirements (Test Description)

- **Test:** Given status transitions (idle→saving→saved, →error), the indicator updates its
  label/icon.
- **Test:** Given any status change, the toolbar layout does not shift (reserved slot, fixed
  size).
- **Test:** Given an error status, the indicator is clearly distinguishable and (optionally)
  offers retry.
- **Test:** The indicator reads the Phase 04 signal (no duplicate status state).

## Acceptance Criteria

- [ ] Indicator bound to the Phase 04 autosave status signal.
- [ ] Renders in the Phase 03 reserved toolbar slot with fixed sizing.
- [ ] Verified zero layout shift across all status transitions.
- [ ] Distinct error state.
- [ ] Vitest covers status rendering + layout stability; lint/format/typecheck pass.

## Files to Create

- `app/shell/AutosaveIndicator.tsx` — status indicator.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Use a fixed-width container + opacity/cross-fade; never change toolbar element sizes on
  status change (the "no layout shift" requirement).
- Consume the signal from Phase 04 task 007 — don't recompute status.
- Completed on 2026-06-25: the top bar now renders a fixed-width autosave indicator driven by
  the shared document autosave status signal, with distinct saving/saved/error states and no
  toolbar reflow.
