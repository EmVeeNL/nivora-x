---
task: 003
phase: 04
title: Stable Node ID Generation
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 003 — Stable Node ID Generation

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Provide collision-free, stable node ID generation used whenever nodes are created or
duplicated.

## Context

Node IDs anchor selection, undo/redo, and future CSS scoping (Phase 10), so they must be
unique within a document and stable across save/load. Duplication must produce fresh IDs
for the copied subtree while preserving internal references' integrity.

## Requirements (Test Description)

- **Test:** Given the generator, produced IDs are unique across many generations (no
  collisions in a large batch).
- **Test:** Given a loaded document, existing IDs are preserved (generation only fills
  new/missing nodes).
- **Test:** Given a duplicated subtree, every node gets a new unique ID and the subtree's
  structure is preserved.
- **Test:** IDs are valid for use as CSS identifiers/selectors (charset/length constraints).

## Acceptance Criteria

- [ ] Unique, stable ID generator with negligible collision risk.
- [ ] Preserves existing IDs on load; only assigns to new nodes.
- [ ] Subtree duplication re-IDs the whole copied subtree correctly.
- [ ] IDs are CSS-selector-safe.
- [ ] Vitest covers uniqueness/duplication; lint/format/typecheck pass.

## Files to Create

- `app/document/ids.ts` — ID generation + subtree re-ID helper.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep IDs short but selector-safe (Phase 10 scopes CSS by them).
- The subtree re-ID helper is used by the store's `duplicate` op (task 004).
