---
task: 003
phase: 07
title: Visibility & Lock Toggles
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 003 — Visibility & Lock Toggles

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add per-node visibility and lock toggles in the Navigator, with their editor-side semantics:
hidden nodes are dimmed/skipped in the editor canvas, and locked nodes resist
selection/edit/move.

## Context

Visibility and lock are node metadata in the Phase 04 schema. This task surfaces them in the
tree and enforces them across the editor via a shared `canInteract(node)` guard used by the
canvas selection (Phase 05) and DnD (Phase 06). Front-end honoring is deferred to Phase 10.

## Requirements (Test Description)

- **Test:** Given a visibility toggle, the node's visibility metadata updates and the canvas
  dims/hides it accordingly.
- **Test:** Given a lock toggle, the node's lock metadata updates.
- **Test:** Given a locked node, canvas selection and DnD reject interaction with it (via the
  shared guard).
- **Test:** Given toggles, they reflect current state and are keyboard-operable.
- **Test:** Toggles persist through save/load.

## Acceptance Criteria

- [x] Visibility + lock toggles per tree row, bound to node metadata via store ops.
- [x] Hidden nodes dim/skip in the editor canvas.
- [x] Locked nodes resist selection/edit/move via a shared `canInteract(node)` guard.
- [x] Guard reused by canvas + DnD (no duplicated rules).
- [x] Vitest covers toggles + guard; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/navigator/NodeStateToggles.tsx` — visibility/lock controls.
- `app/document/canInteract.ts` — shared interaction guard.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- `canInteract` is consumed by Phase 05 selection and Phase 06 DnD — wire it into both.
- Decide editor visual for "hidden" (reduced opacity + not selectable) vs fully removed;
  keep it editable from the tree even when hidden.
