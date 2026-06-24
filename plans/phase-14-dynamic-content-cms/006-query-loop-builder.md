---
task: 006
phase: 14
title: Query-Loop Builder
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 006 — Query-Loop Builder

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Extend the Phase 13 basic loop into a full query-loop builder: controls for post type,
taxonomy/meta filters, ordering, count, offset, and pagination, stored as a query spec the PHP
renderer executes.

## Context

The query builder powers custom listings (recent posts, filtered archives, related content).
Each loop item becomes the binding context (task 004) for elements inside it. Pagination ties
into front-end navigation.

## Requirements (Test Description)

- **Test:** Given query controls, a query spec (type/filters/order/count/offset/pagination) is
  stored on the loop element.
- **Test:** Given a spec, the PHP renderer runs the matching `WP_Query` and repeats the loop
  item per result.
- **Test:** Given bindings inside the loop, each item resolves against its own post.
- **Test:** Given pagination, page navigation works on the front end.
- **Test:** Given an empty result, a defined empty state renders.

## Acceptance Criteria

- [ ] Query-builder controls producing a stored query spec.
- [ ] PHP executes the query; loop item repeats per result; inner bindings use the item context.
- [ ] Pagination + empty-state handling.
- [ ] Sensible limits/defaults (no unbounded queries).
- [ ] Vitest + Pest cover the builder + execution; gates green.

## Files to Create

- `app/dynamic/QueryBuilder.tsx` — query-spec controls.
- `src/Dynamic/QueryRunner.php` — query spec → `WP_Query` + loop execution.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Build on the Phase 13 post-loop element; the spec replaces the "basic main-query" behavior.
- Sanitize/validate the spec server-side; cap counts; paginate.
