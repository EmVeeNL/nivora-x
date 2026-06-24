---
task: 004
phase: 05
title: Single-Select & Hover (Store-Synced)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 004 — Single-Select & Hover (Store-Synced)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Wire canvas interaction: clicking a rendered element selects it (single selection synced to
the Phase 04 store) and hovering tracks a hovered element, so other panels can react to the
current selection/hover.

## Context

Selection is the backbone of the inspector (Phase 08), navigator (Phase 07), and breadcrumb.
The store already holds selection state (Phase 04); this task connects canvas pointer events
to it across the iframe boundary. The visual overlay is task 005; here it's the data/event
wiring.

## Requirements (Test Description)

- **Test:** Given a click on a rendered element, the store selection updates to that node's id.
- **Test:** Given a click on empty canvas, selection clears (defined behavior).
- **Test:** Given hover over an element, the hovered-node state updates; leaving clears it.
- **Test:** Given selection from elsewhere (e.g. programmatic), the canvas reflects it.
- **Test:** Pointer events resolve to the correct node even when nested (innermost target).

## Acceptance Criteria

- [ ] Click-to-select (single) synced to store selection, across the iframe boundary.
- [ ] Hover tracking with enter/leave.
- [ ] Empty-canvas click behavior defined and implemented.
- [ ] Nested elements resolve selection to the innermost target.
- [ ] Vitest covers select/hover logic; lint/format/typecheck pass.

## Files to Create

- `app/canvas/useCanvasSelection.ts` — pointer→node resolution + store sync.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Resolve the target node via a data-attribute (e.g. `data-node-id`) on rendered elements;
  set it in the renderer (task 003).
- Handle the iframe event boundary explicitly (listen within the iframe document).
