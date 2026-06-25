---
task: 005
phase: 06
title: Canvas Reorder / Re-nest
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 005 — Canvas Reorder / Re-nest

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Enable dragging an existing canvas element to reorder it among siblings or re-nest it into
another container, honoring nesting rules, via the Phase 04 store move op.

## Context

Reuses the dnd foundation + drop resolution (task 003) with a **move** intent (vs task 004's
insert). The dragged source is a rendered canvas node rather than a library item. Both share
the same resolution + indicators, so the experience is consistent.

## Requirements (Test Description)

- **Test:** Given an element dragged to a new index among its siblings, it reorders correctly.
- **Test:** Given an element dragged into a different container, it re-nests (honoring rules).
- **Test:** Given an attempt to move a node into its own descendant, it is rejected.
- **Test:** Given a move, it commits via the store move op (undoable) and selection follows.
- **Test:** Indicators reflect the resulting position before drop.

## Acceptance Criteria

- [x] Reorder among siblings and re-nest across containers via drag.
- [x] Nesting rules enforced; move-into-descendant rejected.
- [x] Commit via Phase 04 store move op; undoable; selection follows.
- [x] Shares the task-003 resolution + indicators with insertion.
- [x] Vitest covers reorder/re-nest/guards; lint/format/typecheck pass.

## Files to Create

- `app/canvas/dnd/useMoveOnDrop.ts` — move-intent handler over drop resolution.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- The dragged source is a rendered node (use its `data-node-id` from Phase 05).
- Guard against descendant-target moves before committing (reuse the store's move guard).
