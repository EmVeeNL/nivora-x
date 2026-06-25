---
task: 008
phase: 10
title: Tests, Front-End E2E & Polish
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [005, 006, 007]
retry_count: 0
---

# Task 008 — Tests, Front-End E2E & Polish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 005, 006, 007
> **Retry count:** 0

## Description

Round out coverage with an end-to-end front-end render check (build a page in the editor,
publish, view it on the front end) and polish, closing the rendering/parity phase.

## Context

With PHP rendering, both CSS generators, the front-end switch, the unified editor, and the
parity harness in place, this verifies the full loop on the real stack: edit → publish →
visitor sees the page, matching the editor.

## Requirements (Test Description)

- **Test (E2E):** Compose a page in the editor, publish it, load the front-end URL, and assert
  the rendered HTML + applied styles match expectations.
- **Test:** Editor canvas and front-end output visually agree for a representative page.
- **Test:** Responsive output (a narrower breakpoint override) renders via media queries on
  the front end.
- **Test:** `pnpm` JS gates + Pest + PHPCS + PHPStan + the parity harness all pass in CI.

## Acceptance Criteria

- [ ] E2E edit→publish→front-end render check green.
- [ ] Editor ↔ front-end visual agreement on a representative page.
- [ ] Responsive media-query output verified on the front end.
- [ ] All gates (JS, PHP, parity) green in CI.

## Files to Create

- `e2e/frontend-render.spec.ts` — edit→publish→front-end E2E.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- This closes Phase 10: NivoraX pages render for visitors and match the editor.
- Note remaining performance work (critical CSS, minification, lazy) is deferred to Phase 18.
