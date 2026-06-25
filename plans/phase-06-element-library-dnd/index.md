---
phase: 06
slug: element-library-dnd
title: Element Library, Left Rail & Drag-and-Drop
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 06 — Element Library, Left Rail & Drag-and-Drop

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Make the editor compositional: add the **left mini icon-rail** that switches left panels,
the **Element Library** palette (categorized + searchable) as its first panel, and
**dnd-kit**-powered editing — dragging a new element from the library into the
canvas/containers, and dragging existing elements within the canvas to reorder/re-nest —
with insertion indicators and nesting-rule enforcement, all routed through the Phase 04
store ops (undoable). Reuses Phase 05's `useFrameRect` mapping.

## Scope

- **Left icon-rail + panel-switching system:** a generic, icon-only rail of registered left
  panels; Element Library is the first (Navigator registers in Phase 07). Clicking the
  active icon collapses the panel. Active-panel/collapse state in the Phase 03 UI store.
- **Element Library panel:** collapsible categories (e.g. Layout, Content) + search over
  the Phase 05 registry; only the first visible category opens by default; each item shows
  label/icon and is draggable.
- **dnd-kit foundation** spanning the editor chrome (rail/palette) and the **iframe canvas**,
  reusing `useFrameRect` for drop-position math + insertion indicators.
- **Palette → canvas insertion:** drop a new element (with defaults) at the indicated
  position, honoring element nesting rules; indicators for between-siblings and into-empty-
  container drops.
- **Canvas reorder/move:** drag an existing element to reorder or re-nest it, honoring rules.
- **Single drop-resolution pipeline** (intent: insert vs move) → Phase 04 store ops
  (insert/move); **undoable**; selection follows the affected node.
- **Drop validation** + clear feedback for invalid targets; **keyboard-accessible dragging**.
- Vitest + an E2E happy path (drag an element into the canvas).

## Out of Scope

- The Navigator / layer tree — Phase 07 (only the rail slot is prepared here; tree DnD will
  reuse this foundation).
- Inspector controls (Phase 08), styling, breakpoints (Phase 09).
- Cross-document/template DnD, copy/paste (later).
- Elements beyond the Phase 05 starter set.

## Success Criteria

- [x] The left icon-rail switches left panels; Element Library is the active first panel;
      clicking the active icon collapses it.
- [x] The Element Library lists registered elements in collapsible categories with working
      search; only the first visible group opens by default.
- [x] Dragging a library item into the canvas inserts a new element (defaults) at the
      indicated position, honoring nesting rules.
- [x] Dragging an existing element reorders/re-nests it; invalid drops are rejected with
      feedback.
- [x] Insertion indicators show the drop position (between siblings, into empty containers).
- [x] All DnD mutations go through Phase 04 store ops, are undoable, and selection follows.
- [x] Keyboard drag-and-drop works.
- [x] Vitest + an E2E drag-insert happy path pass; lint/format/typecheck/build green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Left icon-rail + left-panel switching system (hosts multiple panels; Element Library first) | — | Done |
| 002  | Element Library panel: categorized, searchable, collapsible list of registered elements (draggable items) | 001 | Done |
| 003  | dnd-kit foundation across chrome ↔ iframe (context, sensors, drop-target + indicator infra reusing `useFrameRect`) | — | Done |
| 004  | Palette → canvas insertion (drop resolution, nesting rules, defaults, indicators) | 002, 003 | Done |
| 005  | Canvas reorder / re-nest of existing elements | 003 | Done |
| 006  | Drop validation + feedback, keyboard DnD, selection-follow, tests (unit + E2E) + polish | 004, 005 | Done |

## Architectural Notes

- The **left-panel system is generic:** a rail of registered panels (icon + component).
  Element Library registers first; Navigator (Phase 07) second; future panels later. State
  lives in the Phase 03 UI store.
- **dnd-kit context spans chrome and iframe** — dragging across the iframe boundary is the
  hard part. Reuse Phase 05's `useFrameRect` for drop-position math and indicators; **spike
  this early** (task 003) before building insertion.
- **One drop-resolution pipeline** handles both intents (insert new vs move existing),
  computing target parent + index against element nesting rules (Phase 05), then calling the
  Phase 04 store ops — keeping undo and selection consistent.
- Keyboard accessibility via dnd-kit from the start.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Cross-iframe dnd-kit reliability | H | H | Spike in task 003 before building on it; reuse `useFrameRect`; define fallbacks. |
| Ambiguous drop targets in deep nesting | M | M | Clear insertion indicators + strict acceptance rules. |
| Insert vs reorder logic tangles | M | M | Single drop-resolution pipeline with an explicit intent flag. |
| Drag-feedback perf on large trees | M | L | Throttle rect computation; memoize indicators. |
