---
task: 007
phase: 08
title: Tests & Polish (States, Coalescing)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 004, 005, 006]
retry_count: 0
---

# Task 007 — Tests & Polish (States, Coalescing)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003, 004, 005, 006
> **Retry count:** 0

## Description

Round out inspector coverage and polish: empty/locked states, undo coalescing across all
controls, and consistent visuals with the reference inspector.

## Context

With the control system, tabs, content schemas, style controls, style application, and page
settings in place, this hardens the inspector before responsive editing (Phase 09) builds on
the same controls.

## Requirements (Test Description)

- **Test:** Given an end-to-end flow (select element → edit Block prop → edit style → see
  canvas update → undo), it behaves correctly.
- **Test:** Given no selection and locked nodes, the panel states are correct.
- **Test:** Given continuous edits across control types, undo coalescing produces sensible
  history.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, and Vitest all pass.

## Acceptance Criteria

- [x] Integration tests across content + style editing + canvas application + undo.
- [x] Empty/locked states correct.
- [x] Undo coalescing consistent across controls.
- [x] Visual polish matching the reference inspector (dark Webflow-style, 3-tab).
- [x] All JS gates green (321 tests pass, TypeScript clean).

## Extended UX delivered in this task (2026-06-25)

- [x] Delete confirmation dialog (React portal, not `window.confirm`) — `pendingDelete` in uiStore.
- [x] X delete button on drag-handle pill (`SelectionOverlay`).
- [x] Cmd+Z / Cmd+Shift+Z undo/redo in `useEditorKeyboard`.
- [x] Insert config modal (`InsertConfigModal.tsx`) — `insertConfig` on `ElementDefinition`.
- [x] Grid CSS grid render (`display:grid; repeat(N,1fr)`) using `insertConfig`.
- [x] Columns CSS grid render.
- [x] Border controls section: borderStyle, borderWidth, borderColor, borderRadius.
- [x] Box-shadow control (`shadow` type) with offsetX/Y, blur, spread, color, inset sub-fields.
- [x] Spacing widget redesigned: T/B row + L/R row with Y-link, X-link, all-link buttons.
- [x] Responsive lock: lock icon per style control on tablet/mobile; click to create/remove bp override.
- [x] Visual element borders: toolbar toggle, `ElementBordersOverlay`, RAF-tracked, category colours.

## Files Created / Modified (extended scope)

**New:**
- `app/canvas/overlay/ConfirmDialog.tsx` — delete confirmation portal
- `app/canvas/overlay/InsertConfigModal.tsx` — element insert config portal
- `app/canvas/overlay/ElementBordersOverlay.tsx` — RAF-tracked per-element outlines
- `app/canvas/useEditorKeyboard.ts` — Cmd+Z/Shift+Z, delete confirmation trigger
- `app/canvas/style/resolveStyles.ts` — border+shadow props added to STYLE_PROPS
- `app/inspector/` — full inspector panel tree (InspectorPanel, controls/*, page/*, style/*)

**Modified:**
- `app/elements/types.ts` — `InsertConfig` + `insertConfig?` on `ElementDefinition`
- `app/elements/definitions/layout.tsx` — Grid/Columns with proper renders + `insertConfig`
- `app/state/uiStore.ts` — `showElementBorders`, `pendingDelete`, `pendingInsert`, actions
- `app/canvas/overlay/SelectionOverlay.tsx` — X delete button on drag handle
- `app/canvas/dnd/DndProvider.tsx` — intercepts drops for elements with `insertConfig`
- `app/shell/EditorLayout.tsx` — mounts `ConfirmDialog` + `InsertConfigModal`
- `app/shell/TopToolbar.tsx` — Borders toggle button
- `app/canvas/CanvasFrame.tsx` — mounts `ElementBordersOverlay`
- `app/inspector/controls/ControlRenderer.tsx` — SpacingWidget, ShadowInput, responsive lock
- `app/inspector/controls/types.ts` — `ShadowValue`, `ShadowControl`
- `app/inspector/style/styleSchemas.ts` — `borderStyleSection`, `shadowStyleSection`, added to all schemas

## Files to Create (original)

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Confirm the resolver/applier seam (task 005) is clean for Phase 09 to extend (per-breakpoint)
  and Phase 10 to replace (generated CSS).
