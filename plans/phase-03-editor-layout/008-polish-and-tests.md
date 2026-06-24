---
task: 008
phase: 03
title: Visual Polish Pass & Component Tests
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 004, 005, 006, 007]
retry_count: 0
---

# Task 008 — Visual Polish Pass & Component Tests

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003, 004, 005, 006, 007
> **Retry count:** 0

## Description

Do a dedicated design/polish pass so the assembled shell closely matches the reference
(`00-original-style-reference.png` and `01-editor-responsive-dark.png`), and round out
component tests across the shell.

## Context

Per project convention, polish the prototype-quality UI before features build on it. With
all regions in place (003–007), this task tunes spacing, color, typography, borders, and
interaction states to the reference, and ensures the shell behaviors are well tested.

## Requirements (Test Description)

- **Test:** Given the assembled editor, it visually approximates the reference across the
  toolbar, panels, canvas chrome, and breadcrumb (review checklist + screenshots).
- **Test:** Given the shell behaviors (panel collapse, breakpoint width, tabs, section
  collapse), each has component-test coverage.
- **Test:** Given the dark theme, contrast/legibility hold across regions.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, and Vitest all pass.

## Acceptance Criteria

- [ ] Shell closely matches the reference (documented review checklist completed).
- [ ] Spacing/color/typography/borders/interaction states tuned to the reference.
- [ ] Component tests cover all shell behaviors from tasks 003–007.
- [ ] All JS gates green (lint/format/typecheck/build/test).

## Files to Create

- `app/shell/__tests__/` — component tests across shell pieces (as needed).
- `docs/editor-shell-review.md` — visual review checklist vs the reference.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Compare side-by-side with the reference screenshots; capture before/after.
- This is the last Phase 03 task — leaving the shell clean here pays off across the whole
  editor batch (Phases 05–09 build directly on it).
