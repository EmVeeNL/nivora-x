---
task: 002
phase: 06
title: Element Library Panel (Categorized, Searchable, Collapsible)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Element Library Panel (Categorized, Searchable, Collapsible)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the Element Library panel: a categorized, searchable list of registered elements
(from the Phase 05 registry), with each item presented as a draggable card (label + icon).
Category groups are collapsible; by default only the first visible group is expanded.

## Context

This is the first panel in the left-rail system (task 001) and the drag **source** for
insertion (task 004). Categories + search are set up now even with the small starter set so
the catalog scales toward the component-library direction from the screenshots.

## Requirements (Test Description)

- **Test:** Given the registry, the panel lists all registered elements grouped by category.
- **Test:** Given a search query, the list filters by element label/keywords and expands
  only the first matching category by default.
- **Test:** Given multiple categories, groups can be expanded/collapsed independently.
- **Test:** Given an item, it renders label + icon and is marked as a drag source.
- **Test:** Given a new element registered in Phase 05, it appears here without library code
  changes.
- **Test:** Empty search results render a sensible empty state.

## Acceptance Criteria

- [x] Categorized, collapsible list of registered elements (e.g. Layout, Content).
- [x] Working search/filter over labels/keywords.
- [x] Only the first visible category is expanded by default.
- [x] Each item is a draggable card (label + icon) — drag wiring completed in task 004.
- [x] Data-driven from the Phase 05 registry (no hard-coded element list).
- [x] Vitest covers listing/search; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/library/ElementLibraryPanel.tsx` — panel + categories + search.
- `app/shell/left/library/ElementCard.tsx` — draggable element card.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Element category metadata should come from the element definition (Phase 05) — add a
  `category` field there if missing.
- Register this panel via `leftPanelRegistry` (task 001).
