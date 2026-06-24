---
task: 004
phase: 03
title: Left Navigation Panel (Placeholder) + Collapse
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 004 — Left Navigation Panel (Placeholder) + Collapse

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Build the left "Navigation" panel with a placeholder layer-tree (static representative
hierarchy) and a collapse/expand behavior driven by UI state.

## Context

Visually matches the reference left panel. The real, document-driven navigator is built in
Phase 07; here it's a static placeholder so the layout reads correctly. Collapse maximizes
the canvas. (The left icon-rail that switches between panels comes in the editor batch,
Phase 06.)

## Requirements (Test Description)

- **Test:** Given the panel, it renders a placeholder hierarchical tree styled like the
  reference.
- **Test:** Given the collapse control, toggling hides/shows the panel via UI state and
  the canvas reclaims the space.
- **Test:** Given a collapsed panel, an affordance to re-expand it remains visible.

## Acceptance Criteria

- [ ] Left panel with a placeholder layer-tree matching the reference look.
- [ ] Collapse/expand bound to UI state; collapsing maximizes the canvas.
- [ ] Re-expand affordance when collapsed.
- [ ] Vitest covers collapse behavior; lint/format/typecheck pass.

## Files to Create

- `app/shell/LeftPanel.tsx` — panel container + collapse.
- `app/shell/NavigatorPlaceholder.tsx` — static placeholder tree.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Structure `LeftPanel` so Phase 06's icon-rail can later swap its contents (Element
  Library vs Navigator) without a rewrite.
- Placeholder tree data can be a small static fixture resembling the reference.
