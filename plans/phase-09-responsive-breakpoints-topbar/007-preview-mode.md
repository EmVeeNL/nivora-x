---
task: 007
phase: 09
title: Preview — In-Editor Clean View
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 007 — Preview — In-Editor Clean View

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** []
> **Retry count:** 0

## Description

Implement Preview as an in-editor mode that hides the panels/rail/overlays and renders the
canvas cleanly at the active breakpoint, with a clear way to exit back to editing.

## Context

The real front-end preview link depends on the Phase 10 renderer. Until then, Preview gives a
chrome-off look at the current design using the existing editor/React render at the active
breakpoint — useful immediately and self-contained.

## Requirements (Test Description)

- **Test:** Given Preview toggled on, panels, rail, breadcrumb, and selection/hover overlays
  are hidden and the canvas renders cleanly.
- **Test:** Given Preview at the active breakpoint, the canvas shows that viewport width.
- **Test:** Given Preview, an exit affordance returns to the full editor with state intact.
- **Test:** Preview does not mutate the document (read-only view).

## Acceptance Criteria

- [x] Preview mode hides chrome + overlays; renders the canvas cleanly.
- [x] Honors the active breakpoint width.
- [x] Exit returns to editing with state preserved.
- [x] Read-only (no mutations).
- [x] Vitest covers toggle/visibility/state; lint/format/typecheck pass.

## Files to Create

- `app/shell/PreviewMode.tsx` — preview toggle + chrome-off rendering.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Drive Preview via the Phase 03 UI store (a `previewMode` flag); reuse the existing canvas
  renderer.
- Note the seam where a real front-end preview link plugs in once Phase 10 exists.
