---
task: 007
phase: 11
title: Token Parity Fixtures, Tests & Polish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 005]
retry_count: 0
---

# Task 007 — Token Parity Fixtures, Tests & Polish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 005
> **Retry count:** 0

## Description

Extend the Phase 10 golden-fixture parity harness to cover token variables and token-
referencing rules (JS == PHP), round out coverage, and polish the token experience.

## Context

Tokens add a new surface (CSS variables + `var()` references) that must stay in parity across
the JS and PHP generators. Folding token cases into the existing harness keeps the two
implementations honest as tokens evolve.

## Requirements (Test Description)

- **Test:** Given token fixtures, the JS and PHP generators emit identical variables blocks
  and identical token-referencing rules.
- **Test:** Given a fixture mixing tokens + raw values + responsive overrides, both sides agree.
- **Test:** Given a deliberately divergent token mapping, the harness fails (catches drift).
- **Test:** `pnpm` JS gates + Pest + PHPCS + PHPStan + the parity harness pass in CI.

## Acceptance Criteria

- [ ] Parity fixtures cover token variables + token-referencing rules + mixed cases.
- [ ] JS == PHP for all token fixtures in CI.
- [ ] Coverage for the token manager, controls, and propagation.
- [ ] Visual polish of the token manager + token-aware controls.
- [ ] All gates (JS, PHP, parity) green.

## Files to Create

- (edit) `fixtures/parity/` — add token fixtures.
- (edit) `app/__tests__/parity.test.ts` + `tests/Parity/ParityTest.php` — token assertions.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 10 harness + normalization; just add token cases.
- This keeps the four-producer parity guarantee intact as tokens enter the CSS pipeline.
