---
task: 001
phase: 12
title: Style-Prop State Dimension & State Switcher
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Style-Prop State Dimension & State Switcher

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Add an interaction-state dimension (default / hover / focus / active) to style props,
extend the resolver to compose state × breakpoint, and add an inspector state switcher with
an editor preview of the active editing-state.

## Context

This is the foundational model change Phase 12 builds on: a style value becomes per-state,
each state holding the Phase 04 responsive `{ base, <bp> }`. It must extend — not fork — the
Phase 09 resolver and stay consistent with the CSS generators (task 006). The state switcher
lets users edit a specific state; the canvas previews it.

## Requirements (Test Description)

- **Test:** Given a style prop, it can hold per-state values; default state matches the prior
  shape (backward-compatible).
- **Test:** Given the resolver, it resolves a value for a given (state, breakpoint) pair via
  the canonical order.
- **Test:** Given the state switcher, selecting a state routes control edits to that state.
- **Test:** Given the active editing-state, the canvas previews that state's styles.
- **Test:** Existing default-state documents load unchanged (migration/compat).

## Acceptance Criteria

- [ ] Style-prop model extended with state (default/hover/focus/active), backward-compatible.
- [ ] Resolver composes state × breakpoint with one canonical order.
- [ ] Inspector state switcher routing edits to the active state.
- [ ] Editor previews the active editing-state (distinct from pointer hover).
- [ ] Vitest covers model/resolver/switcher; lint/format/typecheck pass.

## Files to Create

- (edit) `app/document/schema/types.ts` — add the state dimension to style props.
- (edit) `app/breakpoints/resolveResponsive.ts` — compose state × breakpoint.
- `app/inspector/StateSwitcher.tsx` — state switcher + editor preview flag.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep default-state values shaped exactly as before so existing docs need no migration (or a
  trivial one via the Phase 04 migration mechanism).
- Define the canonical resolution order (state, then breakpoint) once; tasks 006 + parity
  fixtures depend on it.
