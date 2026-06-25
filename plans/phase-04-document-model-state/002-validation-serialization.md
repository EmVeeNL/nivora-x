---
task: 002
phase: 04
title: Schema Validation & Serialization
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Schema Validation & Serialization

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Implement validation for the node-tree/envelope and lossless JSON serialize/deserialize,
so malformed documents are rejected and valid ones round-trip exactly.

## Context

Validation guards every boundary where a document enters the editor (load, paste, import
later) and every save. Round-trip stability is essential for persistence (task 006) and for
future PHP parity. Validation is structural here (shape/envelope/version); per-element prop
validation arrives with element schemas in Phase 05.

## Requirements (Test Description)

- **Test:** Given a valid envelope/tree, validation passes.
- **Test:** Given malformed input (missing `id`/`type`, bad nesting, wrong envelope), it is
  rejected with a clear error.
- **Test:** Given a valid document, `serialize` → `deserialize` yields a deep-equal document
  (lossless round-trip).
- **Test:** Given unknown/extra fields, behavior is defined (preserved or stripped) and
  tested.

## Acceptance Criteria

- [ ] Structural validator for node tree + envelope + version.
- [ ] Lossless serialize/deserialize (deep-equal round-trip).
- [ ] Clear, typed validation errors.
- [ ] Defined handling of unknown fields.
- [ ] Vitest covers valid/invalid/round-trip; lint/format/typecheck pass.

## Files to Create

- `app/document/schema/validate.ts` — structural validation.
- `app/document/schema/serialize.ts` — serialize/deserialize.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Pick a validation approach (hand-rolled vs a schema lib) mindful that Phase 05 will extend
  it with per-element prop schemas.
- Keep serialization deterministic (stable key ordering) to make round-trip + future diffing
  reliable.
