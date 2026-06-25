---
phase: 07
slug: navigator
title: Navigator
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 07 — Navigator

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Build the functional **Navigator** — a hierarchical layer tree wired to the Phase 04
document store, registered as the second left-rail panel (Phase 06). It provides two-way
selection sync with the canvas, expand/collapse, **visibility & lock toggles, rename,
duplicate & delete**, and **drag-to-reorder/re-nest** reusing the Phase 06 dnd-kit pipeline.
Replaces the Phase 03 placeholder navigator.

## Scope

- Register the Navigator as the **second left-rail panel** (Phase 06 panel system).
- Live, **virtualized** tree view of the node hierarchy from the store.
- **Two-way selection sync** with the canvas (Phase 05 selection); optional hover sync.
- **Expand/collapse** (state in the Phase 03 UI store).
- Per-node controls: **visibility toggle**, **lock toggle**, **rename** (name metadata),
  **duplicate**, **delete** — all via Phase 04 store ops (undoable).
- **Drag-to-reorder/re-nest** within the tree via the Phase 06 drop-resolution pipeline +
  element nesting rules; undoable.
- **Editor semantics:** locked nodes resist selection/edit/move; hidden nodes are dimmed/
  skipped in the editor.
- Keyboard navigation; Vitest component + reorder coverage.

## Out of Scope

- Inspector (Phase 08); breakpoints / top bar (Phase 09).
- **Front-end honoring** of visibility/lock — later front-end batch (Phase 10); editor
  behavior only here.
- Multi-select (consistent with Phase 05 single-select).

## Success Criteria

- [x] Navigator registered as a left-rail panel; switches with the Element Library.
- [x] Tree reflects the live hierarchy and updates on store changes; virtualized.
- [x] Selecting in the tree selects on canvas and vice versa.
- [x] Expand/collapse works and persists in UI state.
- [x] Visibility + lock toggles work; lock prevents selection/edit/move; hidden nodes dim
      in the editor.
- [x] Rename updates the node name (tree + breadcrumb).
- [x] Duplicate/delete mutate via store ops and are undoable.
- [x] Drag-to-reorder/re-nest honors nesting rules via the Phase 06 pipeline; undoable.
- [x] Vitest covers tree render, selection sync, controls, and reorder; JS gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Navigator panel registration + live, virtualized tree bound to the store | — | Done |
| 002  | Two-way selection sync (tree ↔ canvas) + expand/collapse | 001 | Done |
| 003  | Visibility + lock toggles (+ editor selection/edit semantics) | 001 | Done |
| 004  | Rename + duplicate + delete (store ops, undoable) | 001 | Done |
| 005  | Tree drag-to-reorder/re-nest (reuse Phase 06 pipeline + nesting rules) | 001 | Done |
| 006  | Tests + polish | 002, 003, 004, 005 | Done |

## Architectural Notes

- The Navigator is a **second view of the same model** — all mutations go through Phase 04
  store ops; tree and canvas never diverge. Selection has a single source of truth in the store.
- **Reuse Phase 06's drop-resolution pipeline** for tree reorder (intent: move) so canvas
  and tree share one path + nesting rules; the pipeline abstracts target computation per
  surface (tree rows vs canvas rects).
- **Lock/visibility are node metadata** (Phase 04 schema). Centralize a `canInteract(node)`
  guard used by both canvas and tree; front-end honoring is deferred to Phase 10.
- Expand/collapse is ephemeral **UI state** (Phase 03 store), not document data.
- Virtualize rows; memoize; stable keys by node id.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Tree ↔ canvas selection desync | M | M | Single selection source of truth in the store. |
| Lock semantics interacting with selection/DnD across surfaces | M | M | One shared `canInteract(node)` guard for canvas + tree. |
| Reorder pipeline differs between tree rows and canvas rects | M | M | Abstract target computation per surface behind the shared pipeline. |
| Large/deep trees lag | M | L | Virtualization + memoization. |
