---
task: 002
phase: 07
title: Selection Sync & Expand/Collapse
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Selection Sync & Expand/Collapse

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Wire two-way selection sync between the Navigator tree and the canvas, and add
expand/collapse of tree nodes with state in the Phase 03 UI store.

## Context

Selection has a single source of truth in the Phase 04 store (set up in Phase 05). The
Navigator both reflects it (highlight the selected row, auto-reveal it) and drives it (click
a row to select on canvas). Expand/collapse is ephemeral UI state.

## Requirements (Test Description)

- **Test:** Given a canvas selection, the corresponding tree row highlights and is revealed
  (ancestors expanded/scrolled into view).
- **Test:** Given a click on a tree row, the store selection updates and the canvas reflects it.
- **Test:** Given expand/collapse toggles, child rows show/hide and the state persists in UI
  state.
- **Test:** Given hover (optional), tree and canvas hover states stay consistent.

## Acceptance Criteria

- [x] Two-way selection sync (tree ↔ canvas) via the single store selection.
- [x] Selected node auto-revealed in the tree (ancestors expanded).
- [x] Expand/collapse with state in the Phase 03 UI store.
- [x] Vitest covers sync + expand/collapse; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/navigator/useTreeSelection.ts` — selection sync + reveal.
- `app/shell/left/navigator/expandState.ts` — expand/collapse UI state.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Don't duplicate selection state — read/write the store selection from Phase 04/05.
- Auto-reveal should expand only ancestors of the selected node, not the whole tree.
