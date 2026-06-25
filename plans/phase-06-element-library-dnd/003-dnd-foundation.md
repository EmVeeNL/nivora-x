---
task: 003
phase: 06
title: dnd-kit Foundation Across Chrome ↔ iframe
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 003 — dnd-kit Foundation Across Chrome ↔ iframe

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Set up the dnd-kit foundation that spans the editor chrome (rail/palette) and the iframe
canvas: drag context, sensors, drop-target detection, and the insertion-indicator
infrastructure, reusing Phase 05's `useFrameRect` for in-iframe coordinate math.

## Context

This is the **highest-risk task** in the editor batch — dragging across the iframe boundary
is hard. It must be spiked and proven here before insertion (004) and reorder (005) build on
it. Drop-position resolution and indicators are centralized so both intents (insert/move)
share them.

## Requirements (Test Description)

- **Test:** Given a drag started in the chrome, drop targets inside the iframe canvas are
  detected (collision works across the boundary).
- **Test:** Given a hover over a drop zone, an insertion indicator renders at the correct
  position (between siblings / into empty container) using `useFrameRect`.
- **Test:** Given keyboard drag (dnd-kit), the same drop-target detection applies.
- **Test:** Given drag end, a resolved drop descriptor (target parent + index) is produced
  for consumers (tasks 004/005).
- **Test:** Cross-boundary pointer/scroll offsets are handled (no drift).

## Acceptance Criteria

- [x] dnd-kit context + sensors spanning chrome and iframe.
- [x] Drop-target detection + insertion-indicator infra reusing `useFrameRect`.
- [x] A reusable drop-resolution producing `{ targetParentId, index }`.
- [x] Keyboard drag supported.
- [x] Vitest covers resolution/indicator logic; lint/format/typecheck pass.

## Files to Create

- `app/canvas/dnd/DndProvider.tsx` — dnd context + sensors.
- `app/canvas/dnd/dropResolution.ts` — drop descriptor computation.
- `app/canvas/dnd/InsertionIndicator.tsx` — indicator rendering.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Spike cross-iframe collision early; if dnd-kit's defaults struggle at the boundary, a
  custom collision strategy over `useFrameRect` rects is the fallback.
- Keep `dropResolution` intent-agnostic; tasks 004/005 attach insert vs move semantics.
