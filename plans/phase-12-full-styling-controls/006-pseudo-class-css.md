---
task: 006
phase: 12
title: Pseudo-Class CSS Emission (States)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 006 — Pseudo-Class CSS Emission (States)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Extend both CSS generators (JS editor + PHP front-end) to emit pseudo-class rules
(`.nivorax-<id>:hover` / `:focus` / `:active`) for per-state style values, composed correctly
with breakpoint media queries.

## Context

The state dimension (task 001) is meaningless on the front end without pseudo-class CSS. Both
generators must emit identical state rules (verified by the parity harness, task 008), and
the state × breakpoint composition must follow the canonical order from task 001.

## Requirements (Test Description)

- **Test:** Given a hover style value, both generators emit a `.nivorax-<id>:hover` rule.
- **Test:** Given per-state + per-breakpoint values, rules nest correctly (pseudo-class within
  the right media query).
- **Test:** Given the JS and PHP generators on the same fixture, state CSS is identical.
- **Test:** Given only default-state values, no pseudo-class rules are emitted (no noise).

## Acceptance Criteria

- [ ] JS + PHP generators emit pseudo-class rules for hover/focus/active.
- [ ] Correct state × breakpoint composition (canonical order).
- [ ] JS == PHP for state fixtures.
- [ ] No spurious rules when only default state is set.
- [ ] Vitest + Pest cover emission; all gates green.

## Files to Create

- (edit) `app/css/generate.ts` — emit pseudo-class rules.
- (edit) `src/Css/CssGenerator.php` — emit pseudo-class rules.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Follow the shared generation rules (`app/css/rules.ts`); keep JS + PHP byte-aligned via the
  parity fixtures (task 008).
- Decide selector specificity for states so they reliably override default (document it).
