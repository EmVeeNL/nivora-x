---
task: 003
phase: 13
title: Reusable Template Parts
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 003 — Reusable Template Parts

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add an embed-by-reference "part" element that inserts another template by id, so a part (e.g.
a header) edited once propagates everywhere it's embedded — with cycle detection.

## Context

Reusability is core to a theme builder. A part element references a template id; the renderer
resolves and inlines it. Because parts can embed parts, cycle detection is required at edit and
render time.

## Requirements (Test Description)

- **Test:** Given a part element referencing a template, the editor + front end render the
  referenced template's content inline.
- **Test:** Given an edit to the referenced template, all embeds reflect it (propagation).
- **Test:** Given a part that would create a cycle, it is detected and blocked (edit + render).
- **Test:** Given a deleted referenced template, embeds fail safe (placeholder/notice).

## Acceptance Criteria

- [ ] Part element embedding a template by reference (editor + front end).
- [ ] Edits to the referenced template propagate to all embeds.
- [ ] Cycle detection at edit + render.
- [ ] Safe handling of missing references.
- [ ] Vitest + Pest cover embedding/propagation/cycles; gates green.

## Files to Create

- `app/elements/definitions/part.ts` — part element (React render resolves the reference).
- `src/Render/Elements/PartRenderer.php` — PHP render resolving the reference.
- `app/templates/cycleCheck.ts` — cycle detection.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reference by template id; resolve lazily at render; never inline a copy (so edits propagate).
- Cycle detection must run on both sides; share the algorithm's rules via fixtures if helpful.
