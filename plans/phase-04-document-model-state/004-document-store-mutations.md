---
task: 004
phase: 04
title: Document Store & Mutation Operations
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 003]
retry_count: 0
---

# Task 004 — Document Store & Mutation Operations

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 003
> **Retry count:** 0

## Description

Build the editor document store holding the node tree + selection, with pure, typed
mutation operations: insert, move, update props, duplicate, and remove.

## Context

This store is the single path through which all tree changes flow — canvas, navigator,
inspector, and DnD (Phases 05–08) call these ops, which keeps undo/redo (task 005) and
persistence (task 006) consistent. Operations must be pure and immutable so history and
change detection are reliable.

## Requirements (Test Description)

- **Test:** Given `insert`, a node is added at a target parent/index and the tree updates
  immutably.
- **Test:** Given `move`, a node relocates (incl. across parents) without duplication or
  loss; invalid moves (into own descendant) are rejected.
- **Test:** Given `updateProps`, a node's props update at base or a given breakpoint.
- **Test:** Given `duplicate`, a node/subtree is copied with fresh IDs (task 003) adjacent
  to the original.
- **Test:** Given `remove`, a node/subtree is deleted and selection updates sensibly.
- **Test:** Given selection actions, selecting/clearing updates store state.

## Acceptance Criteria

- [ ] Store holds tree + selection with typed selectors.
- [ ] Pure, immutable ops: insert, move, update props (base + breakpoint), duplicate, remove.
- [ ] Guards against invalid operations (e.g. move into descendant).
- [ ] Selection updates coherently after structural changes.
- [ ] Vitest covers each op + edge cases; lint/format/typecheck pass.

## Files to Create

- `app/document/store.ts` — document store (state + actions).
- `app/document/operations.ts` — pure tree mutation functions.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep operations as pure functions over the tree; the store wraps them. This makes undo/redo
  (task 005) and tests straightforward.
- Nesting rules are placeholder here (generic) — Phase 05 supplies real per-element rules.
- Use structural sharing for performance on large trees.
