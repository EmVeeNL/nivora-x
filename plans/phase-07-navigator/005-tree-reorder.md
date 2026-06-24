---
task: 005
phase: 07
title: Tree Drag-to-Reorder / Re-nest
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 005 — Tree Drag-to-Reorder / Re-nest

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Enable dragging nodes within the Navigator tree to reorder among siblings or re-nest into
other containers, reusing the Phase 06 drop-resolution pipeline (move intent) and element
nesting rules, committed via the Phase 04 store move op.

## Context

Tree reorder mirrors canvas reorder (Phase 06 task 005) — same store op, same nesting rules,
same undo — but the drop surface is tree rows rather than canvas rects. The Phase 06 pipeline
abstracts target computation per surface, so this task supplies a tree-row target resolver.

## Requirements (Test Description)

- **Test:** Given a row dragged between siblings, the node reorders at the target index.
- **Test:** Given a row dropped onto/into a container row, the node re-nests (honoring rules).
- **Test:** Given a move into a descendant, it is rejected.
- **Test:** Given a tree move, the canvas reflects it and the change is undoable.
- **Test:** A drop indicator shows the target position between/within rows.

## Acceptance Criteria

- [ ] Drag-reorder among siblings and re-nest across containers in the tree.
- [ ] Nesting rules enforced; descendant-target moves rejected.
- [ ] Commits via Phase 04 move op; canvas stays in sync; undoable.
- [ ] Reuses the Phase 06 pipeline with a tree-row target resolver.
- [ ] Vitest covers reorder/re-nest/guards; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/navigator/useTreeReorder.ts` — tree-row drop target resolver + move commit.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 06 `dropResolution`/move handler; provide a tree-surface target computation
  (row position → parent/index) instead of canvas rects.
- Keep indicators visually consistent with the rest of the tree.
