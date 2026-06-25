---
task: 001
phase: 05
title: Element-Definition Contract & Registry
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Element-Definition Contract & Registry

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Define the element-definition contract and a registry that maps an element `type` to its
definition (props schema + defaults, nesting rules, React render component, display
metadata), with a safe fallback for unknown types.

## Context

This contract is the extensibility seam for the whole builder — every element (this phase's
starter set and all future ones) registers through it. It must be designed **parity-aware**:
leave declared slots for the PHP render (Phase 10) and the inspector control schema
(Phase 08), even though neither is implemented now. Nothing renders yet; this is the
type-level foundation tasks 002–005 build on.

## Requirements (Test Description)

- **Test:** Given a registered definition, the registry returns it by `type`.
- **Test:** Given an unknown `type`, the registry yields a safe fallback (placeholder
  definition), never throwing.
- **Test:** Given a definition, it exposes props schema + defaults, nesting rules
  (accepts-children / allowed child types), a React render component, and metadata
  (label/icon).
- **Test:** Registering a duplicate `type` is handled deterministically (defined behavior).
- **Test:** The contract types compile under strict TS.

## Acceptance Criteria

- [ ] `ElementDefinition` contract with props/defaults, nesting rules, render, metadata,
      and reserved (typed but optional) slots for PHP render + control schema.
- [ ] Registry: register, get-by-type, list, with a safe unknown-type fallback.
- [ ] Deterministic duplicate-registration behavior.
- [ ] Strict TS clean; Vitest covers registry behavior; lint/format pass.

## Files to Create

- `app/elements/types.ts` — `ElementDefinition` contract + supporting types.
- `app/elements/registry.ts` — registry (register/get/list) + fallback.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the PHP-render + control-schema slots declared-but-optional so Phases 08/10 fill them
  without changing existing registrations.
- Nesting rules feed the Phase 04 store guards (wired in task 002); keep them serializable/
  inspectable.
