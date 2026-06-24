---
task: 002
phase: 03
title: Layout Scaffold & Local UI State
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Layout Scaffold & Local UI State

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the three-panel layout scaffold (top toolbar region · left panel · center canvas ·
right panel · bottom breadcrumb region) and a small **local UI-state store** for ephemeral
shell state (panel visibility, active breakpoint, active inspector tab, section open/closed).

## Context

This is the structural skeleton tasks 003–007 fill. The UI-state store is intentionally
separate from the future document store (Phase 04) so they evolve independently. State here
is ephemeral and never persisted to a document.

## Requirements (Test Description)

- **Test:** Given the app, the five layout regions render in the correct positions
  (toolbar, left, center, right, breadcrumb) and fill the viewport.
- **Test:** Given the UI-state store, defaults are correct (both panels visible, a default
  breakpoint, a default tab).
- **Test:** Given store actions, toggling panel visibility / active breakpoint / active tab
  updates state and re-renders.
- **Test:** UI state is isolated from any document state (no cross-contamination).

## Acceptance Criteria

- [ ] Responsive three-panel grid with toolbar + breadcrumb regions filling the viewport.
- [ ] Local UI-state store with panel visibility, active breakpoint, active tab, section
      open/closed.
- [ ] Typed actions/selectors; sensible defaults.
- [ ] Clearly separated from future document state.
- [ ] Vitest covers the store; lint/format/typecheck pass.

## Files to Create

- `app/shell/EditorLayout.tsx` — the five-region grid scaffold.
- `app/state/uiStore.ts` — local UI-state store (typed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Pick the same store library intended for the document store so patterns are consistent,
  but keep this store's scope strictly UI.
- Drive panel collapse (task 004/006) and breakpoint width (task 005) from this store.
