---
task: 005
phase: 05
title: Selection & Hover Overlay
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004]
retry_count: 0
---

# Task 005 — Selection & Hover Overlay

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004
> **Retry count:** 0

## Description

Render the selection and hover overlays in the editor chrome layer, outlining the active and
hovered elements and tracking their position/size as the canvas scrolls, resizes, or the
tree changes.

## Context

The overlay lives outside the iframe (in the editor chrome) but must map to element rects
**inside** the iframe. This coordinate mapping is fiddly and is built here as a reusable
module — Phase 06 drag-and-drop depends on the same math, so it must be centralized and
robust to scroll/resize/breakpoint width changes.

## Requirements (Test Description)

- **Test:** Given a selected element, an outline overlay aligns to its iframe rect.
- **Test:** Given a hovered (non-selected) element, a distinct hover outline renders.
- **Test:** Given canvas scroll / iframe resize / breakpoint width change, overlays
  re-track the element rects.
- **Test:** Given a removed/replaced selected node, the overlay clears or re-targets correctly.
- **Test:** The coordinate mapping is exposed as a reusable utility (consumed later by DnD).

## Acceptance Criteria

- [ ] Selection outline + distinct hover outline mapped to in-iframe rects.
- [ ] Overlays re-track on scroll, resize, and breakpoint width changes (observers).
- [ ] Graceful handling when the target node disappears.
- [ ] A centralized, reusable iframe↔chrome coordinate utility.
- [ ] Vitest covers mapping/tracking logic; lint/format/typecheck pass.

## Files to Create

- `app/canvas/overlay/SelectionOverlay.tsx` — selection + hover outlines.
- `app/canvas/overlay/useFrameRect.ts` — reusable iframe↔chrome rect mapping + observers.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- `useFrameRect` is the shared primitive — Phase 06 drop indicators reuse it; design its API
  with that in mind.
- Account for iframe scroll offset and device-frame width when computing chrome-space rects.
