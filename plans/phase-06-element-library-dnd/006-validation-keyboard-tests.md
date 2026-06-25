---
task: 006
phase: 06
title: Drop Validation, Keyboard DnD, Tests & Polish
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 005]
retry_count: 0
---

# Task 006 — Drop Validation, Keyboard DnD, Tests & Polish

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 005
> **Retry count:** 0

## Description

Finalize the drag-and-drop experience: consistent invalid-drop feedback, keyboard-accessible
dragging across both intents, selection-follow behavior, and full unit + E2E coverage with a
polish pass.

## Context

With insertion (004) and reorder (005) working, this task hardens the interaction: a unified
validation/feedback layer, accessibility, and the E2E happy path that proves "drag an
element into the canvas" end to end. Closes Phase 06 before the Navigator (Phase 07) reuses
this foundation.

## Requirements (Test Description)

- **Test:** Given an invalid drop (either intent), the user gets clear, consistent feedback
  and no mutation occurs.
- **Test:** Given keyboard-only operation, an element can be inserted and reordered via
  keyboard (dnd-kit a11y).
- **Test:** Given any successful drop, selection follows the affected node.
- **Test (E2E):** Dragging an element from the library into the canvas inserts and selects it.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, Vitest, and the E2E spec pass.

## Acceptance Criteria

- [x] Unified invalid-drop feedback across insert + move.
- [x] Keyboard-accessible drag for both intents.
- [x] Selection-follow after every successful drop.
- [x] E2E happy path (library → canvas insert) green.
- [x] All JS gates green.

## Files to Create

- `e2e/element-dnd.spec.ts` — drag-insert E2E happy path.
- `app/canvas/dnd/__tests__/` — unit tests for validation/keyboard/selection (as needed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep feedback styling consistent with the Phase 03 shell and selection overlays.
- This DnD foundation is reused by Phase 07 tree reorder — note any surface-specific seams.
