---
task: 002
phase: 08
title: Right-Panel Tabs (Page / Block / Inspector)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Right-Panel Tabs (Page / Block / Inspector)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Wire the right panel's three functional tabs — **Page**, **Block**, **Inspector** —
replacing the Phase 03 placeholders, driven by the current selection.

## Context

Tab roles: Page = page-level settings; Block = the selected element's content props;
Inspector = the selected element's styling. Block/Inspector populate from the selected node's
control schemas (tasks 003/004); Page is selection-independent (task 006). This task is the
tab framework + selection-driven routing.

## Requirements (Test Description)

- **Test:** Given the right panel, Page/Block/Inspector tabs render and switch (active tab in
  UI state).
- **Test:** Given a selected element, Block and Inspector tabs show that element's controls.
- **Test:** Given no selection, Block/Inspector show an empty state and Page remains available.
- **Test:** Given a locked node, controls render read-only/disabled (defined behavior).

## Acceptance Criteria

- [ ] Functional Page/Block/Inspector tabs replacing Phase 03 placeholders.
- [ ] Tab content driven by selection (Block/Inspector) and always-available Page.
- [ ] Empty-selection and locked-node states handled.
- [ ] Active tab persists in the Phase 03 UI store.
- [ ] Vitest covers tab routing/states; lint/format/typecheck pass.

## Files to Create

- `app/inspector/InspectorPanel.tsx` — tabs + selection-driven routing.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 03 `InspectorTabs`/section structure; make the tab set explicit (Page,
  Block, Inspector).
- Read selection from the single store source; don't duplicate it.
