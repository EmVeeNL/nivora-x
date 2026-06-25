---
task: 001
phase: 07
title: Navigator Panel & Live Tree
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Navigator Panel & Live Tree

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Register the Navigator as the second left-rail panel and render a live, virtualized
hierarchical tree of the document's nodes from the Phase 04 store.

## Context

This replaces the Phase 03 placeholder navigator with a real, store-driven tree and slots
into the Phase 06 left-panel system. It's the base that selection sync, controls, and reorder
(tasks 002–005) build on. Virtualization keeps deep/large trees performant.

## Requirements (Test Description)

- **Test:** Given the Phase 06 rail, the Navigator registers and is switchable with the
  Element Library.
- **Test:** Given a document tree, the panel renders the hierarchy with correct nesting/depth.
- **Test:** Given store mutations (insert/move/remove), the tree updates to match.
- **Test:** Given a large tree, rows are virtualized (only visible rows mount).
- **Test:** Each row shows the node's name/type and is keyed by node id.

## Acceptance Criteria

- [x] Navigator registered via the Phase 06 panel registry.
- [x] Live, virtualized tree reflecting the store hierarchy.
- [x] Updates reactively on store changes.
- [x] Rows show name/type; stable keys by node id.
- [x] Vitest covers render/reactivity; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/navigator/NavigatorPanel.tsx` — panel + virtualized tree.
- `app/shell/left/navigator/TreeRow.tsx` — single node row.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Register via `leftPanelRegistry` (Phase 06 task 001).
- Derive display name from node metadata (name) with a type-based fallback.
