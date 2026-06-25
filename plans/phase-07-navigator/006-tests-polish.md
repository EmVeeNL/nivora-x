---
task: 006
phase: 07
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

Round out Navigator test coverage and polish the panel so tree, selection, controls, and
reorder feel consistent with the canvas and the rest of the shell.

## Context

With the tree, sync, controls, and reorder complete, this hardens the Navigator and verifies
its tight coupling with the canvas (selection, lock/visibility, structural changes) before
later phases build on it.

## Requirements (Test Description)

- **Test:** Given an integration flow (select in tree → canvas selects → rename → reorder →
  undo), it behaves correctly.
- **Test:** Given lock/visibility, canvas + tree honor the shared guard consistently.
- **Test:** Given large/deep trees, virtualization + interactions remain performant.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, and Vitest all pass.

## Acceptance Criteria

- [x] Integration tests across selection sync, controls, and reorder.
- [x] Lock/visibility consistent between canvas and tree.
- [x] Polished visuals consistent with the Phase 03 shell.
- [x] All JS gates green.

## Files to Create

- `app/shell/left/navigator/__tests__/` — integration tests (as needed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Verify selection/structize edge cases: deleting the selected node, reordering the selected
  node, locking an ancestor.
