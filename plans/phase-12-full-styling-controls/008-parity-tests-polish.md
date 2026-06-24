---
task: 008
phase: 12
title: Parity Fixtures, Tests & Polish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003, 004, 005, 006, 007]
retry_count: 0
---

# Task 008 — Parity Fixtures, Tests & Polish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003, 004, 005, 006, 007
> **Retry count:** 0

## Description

Extend the parity harness to states, the new control groups, and custom CSS; round out
coverage; and polish the expanded inspector to match the reference.

## Context

Full styling adds substantial surface (states, four control groups, custom CSS) that must stay
in JS↔PHP parity. This task makes the harness cover it all and ensures the inspector is
coherent and polished now that it's feature-complete for foundational + full styling.

## Requirements (Test Description)

- **Test:** Given fixtures covering states + background/border/position/layout + custom CSS,
  JS == PHP output.
- **Test:** Given a deliberately divergent state/custom-CSS mapping, the harness fails.
- **Test:** Given the expanded inspector, controls are organized/legible per the reference.
- **Test:** `pnpm` JS gates + Pest + PHPCS + PHPStan + the parity harness pass in CI.

## Acceptance Criteria

- [ ] Parity fixtures cover states, all new control groups, and custom CSS.
- [ ] JS == PHP for all in CI.
- [ ] Inspector organized + polished to the reference.
- [ ] All gates (JS, PHP, parity) green.

## Files to Create

- (edit) `fixtures/parity/` — add state + full-styling + custom-CSS fixtures.
- (edit) parity test files (JS + PHP) — add the new assertions.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- The inspector is now large — review IA/grouping against the reference (collapsible sections,
  sensible defaults, search if needed).
- With states + full controls + tokens, the style model is feature-complete for the editor;
  later phases (theme builder, dynamic content) consume it rather than extend it.
