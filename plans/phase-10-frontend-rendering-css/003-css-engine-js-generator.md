---
task: 003
phase: 10
title: CSS Generation Rules & JS Generator
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 003 — CSS Generation Rules & JS Generator

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Define the canonical CSS-generation rules and implement the **JS generator** (used by the
editor for live CSS): node style props + desktop-first responsive overrides + token
references → scoped `.nivorax-<id>` rules with max-width media queries, deterministic and
deduplicated.

## Context

This is the editor-side half of the CSS engine and the source of the rules the PHP generator
(task 004) must match. It extends the Phase 08/09 resolver to emit actual CSS (not just
inline values), using the Phase 09 desktop-first cascade.

## Requirements (Test Description)

- **Test:** Given a node with base style props, the generator emits a scoped rule for its
  `.nivorax-<id>` class.
- **Test:** Given per-breakpoint overrides, it emits correct max-width media queries
  (desktop-first), only for overridden values.
- **Test:** Given token references, they resolve via the seam (concrete values for now).
- **Test:** Given the same tree twice, output is identical (deterministic) and deduplicated.
- **Test:** Output matches the Phase 09 cascade fixtures.

## Acceptance Criteria

- [ ] Documented, canonical generation rules (scoping, cascade, media-query direction).
- [ ] JS generator producing scoped, deduplicated, deterministic CSS.
- [ ] Desktop-first max-width media queries from responsive overrides.
- [ ] Token-reference resolution seam.
- [ ] Vitest covers generation + cascade fixtures; lint/format/typecheck pass.

## Files to Create

- `app/css/generate.ts` — JS CSS generator.
- `app/css/rules.ts` — shared generation rules/constants (the contract).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- `rules.ts` documents the contract the PHP generator (task 004) must reproduce; keep it
  declarative so both languages can follow it.
- Reuse the Phase 09 cascade resolver; here it emits CSS rather than inline values.
