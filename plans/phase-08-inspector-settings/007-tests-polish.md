---
task: 007
phase: 08
title: Tests & Polish (States, Coalescing)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 004, 005, 006]
retry_count: 0
---

# Task 007 — Tests & Polish (States, Coalescing)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
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

- [ ] Integration tests across content + style editing + canvas application + undo.
- [ ] Empty/locked states correct.
- [ ] Undo coalescing consistent across controls.
- [ ] Visual polish matching the reference inspector.
- [ ] All JS gates green.

## Files to Create

- `app/inspector/__tests__/` — integration tests (as needed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Confirm the resolver/applier seam (task 005) is clean for Phase 09 to extend (per-breakpoint)
  and Phase 10 to replace (generated CSS).
