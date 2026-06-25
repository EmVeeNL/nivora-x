---
task: 004
phase: 06
title: Palette → Canvas Insertion
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003]
retry_count: 0
---

# Task 004 — Palette → Canvas Insertion

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003
> **Retry count:** 0

## Description

Wire dragging an element from the Element Library into the canvas: on drop, create a new
element (with its defaults) at the resolved position, honoring element nesting rules, via the
Phase 04 store insert op.

## Context

This is the core Gutenberg-style "drag an element into the editor" interaction. It combines
the library drag source (task 002) with the dnd foundation + drop resolution (task 003) and
the Phase 05 element defaults/nesting rules, committing through the Phase 04 store so it's
undoable and selection follows.

## Requirements (Test Description)

- **Test:** Given a library item dropped into a valid container, a new node (with defaults)
  is inserted at the indicated index.
- **Test:** Given a drop onto a target that rejects the type (nesting rules), the drop is
  refused with feedback (no insertion).
- **Test:** Given a drop into an empty container, the element nests inside it.
- **Test:** Given an insertion, it goes through the store insert op (undoable) and the new
  node becomes selected.
- **Test:** Insertion indicators match where the element actually lands.

## Acceptance Criteria

- [x] Drop a library item → insert a new defaulted element at the resolved parent/index.
- [x] Nesting rules enforced; invalid drops refused with feedback.
- [x] Empty-container nesting works.
- [x] Insertion via Phase 04 store op; undoable; new node selected.
- [x] Vitest covers insert + rejection + empty-container; lint/format/typecheck pass.

## Files to Create

- `app/canvas/dnd/useInsertOnDrop.ts` — insert-intent handler over drop resolution.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Build the new node from the element definition defaults (Phase 05) + a fresh id (Phase 04).
- Validate the drop against nesting rules before committing; reuse the shared
  `canAcceptChild` logic from element definitions.
