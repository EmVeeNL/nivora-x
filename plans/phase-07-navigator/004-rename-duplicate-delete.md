---
task: 004
phase: 07
title: Rename, Duplicate & Delete
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 004 — Rename, Duplicate & Delete

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add Navigator node actions: inline rename (node name metadata), duplicate, and delete — all
through the Phase 04 store ops so they're undoable.

## Context

These are the standard tree management actions, exposed via row controls and/or a context
menu. Names flow into the tree and the breadcrumb. Duplicate/delete operate on a node and its
subtree via existing store ops (Phase 04).

## Requirements (Test Description)

- **Test:** Given inline rename, the node's name metadata updates and shows in the tree (and
  breadcrumb).
- **Test:** Given duplicate, the node/subtree is copied with fresh ids adjacent to the
  original and selected.
- **Test:** Given delete, the node/subtree is removed and selection updates sensibly.
- **Test:** Given each action, it is undoable/redoable via history.
- **Test:** Actions are available via row controls and/or context menu, and keyboard-operable.

## Acceptance Criteria

- [ ] Inline rename writing node name metadata.
- [ ] Duplicate (fresh ids) and delete via Phase 04 store ops.
- [ ] All actions undoable; selection updates coherently.
- [ ] Reachable via row controls / context menu + keyboard.
- [ ] Vitest covers rename/duplicate/delete; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/navigator/NodeActions.tsx` — rename/duplicate/delete controls + menu.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 04 duplicate/remove ops (and the subtree re-id helper) — don't re-implement.
- Empty name should fall back to the type-based display name.
