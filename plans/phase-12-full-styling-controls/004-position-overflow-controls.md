---
task: 004
phase: 12
title: Position & Overflow Controls
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 004 — Position & Overflow Controls

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add Position controls (static/relative/absolute/sticky, offsets, z-index) and Overflow /
visibility controls — declarative and state-aware.

## Context

Position and overflow round out the layout-related styling from the reference inspector. They
interact with the canvas rendering (absolutely-positioned elements) and the selection overlay
(Phase 05), so the overlay must track positioned elements correctly.

## Requirements (Test Description)

- **Test:** Given Position controls, position mode + offsets (top/right/bottom/left) + z-index
  write style props and apply.
- **Test:** Given Overflow controls, overflow/visibility apply.
- **Test:** Given an absolutely-positioned element, the selection overlay tracks its rect
  correctly.
- **Test:** Given a state, position/overflow can be set per state; canvas + CSS reflect it.

## Acceptance Criteria

- [ ] Position (mode/offsets/z-index) + Overflow/visibility controls.
- [ ] State-aware; reflected in canvas + generated CSS.
- [ ] Selection overlay tracks positioned elements.
- [ ] Vitest covers controls + overlay tracking; lint/format/typecheck pass.

## Files to Create

- `app/inspector/style/position/` — position + overflow control group.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Verify the Phase 05 `useFrameRect`/overlay still tracks absolutely-positioned + scrolled
  elements; fix if needed.
- z-index in the canvas should not fight editor overlay stacking — keep overlays above content.
