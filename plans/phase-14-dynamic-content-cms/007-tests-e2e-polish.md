---
task: 007
phase: 14
title: Tests, E2E & Polish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 005, 006]
retry_count: 0
---

# Task 007 — Tests, E2E & Polish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 005, 006
> **Retry count:** 0

## Description

Add end-to-end coverage for dynamic content (a dynamic single template + a custom-loop archive)
and polish the binding + query-builder UX.

## Context

This proves the dynamic pipeline on the real stack: bindings + providers + query builder +
front-end resolution + editor preview, composed with the Phase 13 theme builder.

## Requirements (Test Description)

- **Test (E2E):** Build a single template with bound title/featured-image/meta, publish, view a
  post, and assert the real data renders.
- **Test (E2E):** Build an archive with a custom query loop + bound loop items; assert the
  listing renders correctly with pagination.
- **Test:** Editor preview matches the front-end resolved values for a sample post.
- **Test:** `pnpm` JS gates + Pest + PHPCS + PHPStan + the parity harness pass in CI.

## Acceptance Criteria

- [ ] E2E dynamic single + custom-loop archive green.
- [ ] Editor preview ↔ front-end resolution consistency verified.
- [ ] Binding + query-builder UX polished.
- [ ] All gates green.

## Files to Create

- `e2e/dynamic-content.spec.ts` — dynamic single + custom-loop archive E2E.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Seed posts with meta/taxonomy/author data for the E2E checks.
- This completes the core CMS/dynamic story; provider integrations (ACF/etc.) can follow via
  the seam.
