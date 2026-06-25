---
task: 002
phase: 05
title: Starter Element Set & Nesting Rules
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Starter Element Set & Nesting Rules

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Implement the four starter elements — **Section**, **Container** (both hold sub-elements),
**Heading**, **Text** (leaf content) — as registry definitions, and wire their nesting rules
into the Phase 04 store's insert/move guards.

## Context

These prove the contract end-to-end and give the renderer (task 003) something real to draw.
Section/Container accept children; Heading/Text do not. The nesting rules defined here
replace the placeholder guards the Phase 04 store ops used, so structural integrity is now
enforced by element definitions.

## Requirements (Test Description)

- **Test:** Given each starter element, it registers with defaults, nesting rules, render,
  and metadata.
- **Test:** Given Section/Container, they accept children; given Heading/Text, they reject
  children.
- **Test:** Given the store's insert/move, an attempt to nest a child under Heading/Text is
  rejected via the element nesting rules.
- **Test:** Given defaults, creating each element yields a valid node (validates against the
  Phase 04 schema).
- **Test:** Heading/Text expose a text prop (rendered later; no inline editing this phase).

## Acceptance Criteria

- [ ] Section, Container, Heading, Text registered with full definitions.
- [ ] Section/Container accept children; Heading/Text are leaves.
- [ ] Nesting rules wired into the Phase 04 store insert/move guards (placeholders removed).
- [ ] Element defaults produce schema-valid nodes.
- [ ] Vitest covers registration + nesting enforcement; lint/format/typecheck pass.

## Files to Create

- `app/elements/definitions/section.ts`
- `app/elements/definitions/container.ts`
- `app/elements/definitions/heading.ts`
- `app/elements/definitions/text.ts`
- `app/elements/definitions/index.ts` — registers the starter set.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep render components minimal/structural here; visual detail belongs to task 003 + later
  styling phases.
- Where the Phase 04 store referenced placeholder nesting rules, replace with a lookup into
  element definitions.
