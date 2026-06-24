---
task: 007
phase: 10
title: Golden-Fixture Parity Harness (CI)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003, 004]
retry_count: 0
---

# Task 007 — Golden-Fixture Parity Harness (CI)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003, 004
> **Retry count:** 0

## Description

Build the shared golden-fixture harness that verifies all four producers agree: a set of
node-tree fixtures with expected HTML and CSS, tested by React (Vitest) and PHP (Pest), wired
into CI so any drift fails the build.

## Context

This is the mechanism that makes editor↔front-end parity real and durable. Fixtures are the
single contract for markup + CSS; React render, PHP render, JS CSS, and PHP CSS are all
checked against them. Without this, the two-language duplication silently drifts.

## Requirements (Test Description)

- **Test:** Given each fixture tree, React render HTML == PHP render HTML.
- **Test:** Given each fixture tree, JS CSS == PHP CSS (normalized).
- **Test:** Given a deliberately divergent renderer, the harness fails (proves it catches
  drift).
- **Test:** The harness runs in CI on both the JS and PHP jobs.
- **Test:** Fixtures cover nesting, responsive overrides, and each starter element.

## Acceptance Criteria

- [ ] Shared fixture set (tree → expected HTML + CSS) in a common location.
- [ ] React (Vitest) + PHP (Pest) both assert against the fixtures.
- [ ] Normalization handles insignificant whitespace/ordering differences.
- [ ] CI runs the parity checks and fails on drift.
- [ ] Fixtures cover nesting + responsive + all starter elements.

## Files to Create

- `fixtures/parity/` — shared tree fixtures + expected HTML/CSS.
- `app/__tests__/parity.test.ts` — React/JS side assertions.
- `tests/Parity/ParityTest.php` — PHP side assertions.
- (edit) `.github/workflows/ci.yml` — run parity checks in both jobs.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep fixtures language-neutral (JSON tree + expected strings); both sides load the same files.
- Establish a normalization step (whitespace, attribute order, CSS property order) so
  comparisons are robust but still catch real drift.
- This harness is extended every time an element is added (future phases).
