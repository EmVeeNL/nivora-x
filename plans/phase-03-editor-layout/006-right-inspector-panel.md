---
task: 006
phase: 03
title: Right Inspector Panel (Tabs + Sections)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 006 — Right Inspector Panel (Tabs + Sections)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Build the right "Body" inspector panel with working tabs and collapsible sections (Layout,
Spacing, Size, Typography…) filled with placeholder controls, plus panel collapse.

## Context

Matches the reference inspector. Tabs and section-collapse are real interactions driven by
UI state; the controls inside are visual placeholders. Functional binding to a selected
element (and the Page/Block/Inspector tab semantics) arrives in the editor batch (Phase 08).

## Requirements (Test Description)

- **Test:** Given the inspector, it renders tabs and collapsible sections matching the
  reference layout.
- **Test:** Given the tabs, switching changes the active tab via UI state and shows that
  tab's (placeholder) content.
- **Test:** Given a section header, toggling collapses/expands it (state persisted in UI
  store).
- **Test:** Given the panel collapse control, the panel hides/shows and the canvas reclaims
  space.

## Acceptance Criteria

- [x] Right panel with working tabs + collapsible sections per the reference.
- [x] Placeholder controls inside sections (sliders/inputs/toggles, non-functional).
- [x] Tab + section + panel-collapse state bound to UI store.
- [x] Vitest covers tab/section/collapse behavior; lint/format/typecheck pass.

## Files to Create

- `app/shell/RightPanel.tsx` — panel container + collapse.
- `app/shell/InspectorTabs.tsx` — tab bar bound to UI state.
- `app/shell/InspectorSection.tsx` — collapsible section + placeholder controls.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Use ShadCN tabs/accordion primitives where they fit the reference.
- Phase 08 reuses this structure for the real Page/Block/Inspector tabs — keep the tab set
  configurable, not hard-coded to placeholder labels.
