---
task: 007
phase: 13
title: Tests, E2E & Polish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 006]
retry_count: 0
---

# Task 007 — Tests, E2E & Polish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003, 006
> **Retry count:** 0

## Description

Add an end-to-end theme-builder flow (build a header + footer + single template, set
conditions, publish, view a post on the front end) and polish the template management +
editing experience.

## Context

This verifies the whole theme-builder loop on the real stack: template editing → conditions →
hierarchy override → front-end composition. It's the proof that NivoraX renders a themed site,
not just isolated pages.

## Requirements (Test Description)

- **Test (E2E):** Create header + footer + single templates, set conditions, publish, then load
  a post and assert the header/footer/content render correctly.
- **Test:** Embedded parts render and propagate on the front end.
- **Test:** Conditional precedence picks the right template when multiple match.
- **Test:** `pnpm` JS gates + Pest + PHPCS + PHPStan + the parity harness pass in CI.

## Acceptance Criteria

- [ ] E2E theme-builder happy path green.
- [ ] Parts + conditions + composition verified together.
- [ ] Template management + editing polished.
- [ ] All gates green.

## Files to Create

- `e2e/theme-builder.spec.ts` — header/footer/single → front-end render E2E.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 02/03 provisioning; seed a couple of posts for the single/archive checks.
- This closes the theme-builder core; dynamic field binding + custom queries follow in Phase 14.
