---
task: 001
phase: 08
title: Declarative Control-Schema System
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Declarative Control-Schema System

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Build the declarative control-schema system: a set of control types (text, number, select,
toggle, color, slider, spacing-box, …) and a generic renderer that turns a control schema
into ShadCN controls bound to the selected node's props via the Phase 04 store.

## Context

This fills the control-schema slot reserved on element definitions in Phase 05 and powers
all three inspector tabs. Adding an element later becomes "declare a schema," not "build a
panel." Edits write through store ops with undo coalescing (Phase 04 history batching).

## Requirements (Test Description)

- **Test:** Given a control schema, the renderer outputs the corresponding ShadCN controls.
- **Test:** Given a control bound to a node prop, editing it updates the node via the store.
- **Test:** Given continuous edits (e.g. slider), they coalesce into a single undo entry.
- **Test:** Given a standardized value/unit model, numeric/unit controls read/write it
  consistently.
- **Test:** Unknown control types degrade gracefully (skip + warn).

## Acceptance Criteria

- [ ] Control-type set + a generic schema→UI renderer using ShadCN.
- [ ] Two-way binding to node props via Phase 04 store ops.
- [ ] Undo coalescing for continuous edits.
- [ ] A shared value/unit model (px/%/rem…).
- [ ] Vitest covers rendering/binding/coalescing; lint/format/typecheck pass.

## Files to Create

- `app/inspector/controls/types.ts` — control-schema + value/unit types.
- `app/inspector/controls/ControlRenderer.tsx` — schema→ShadCN renderer + binding.
- `app/inspector/controls/widgets/` — individual control widgets.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Use the strict prop-casting pattern reading node props: `(value as T | undefined) ?? default`.
- The value/unit model is reused by Phases 09 (responsive) and 11 (styling) — design it
  deliberately.
