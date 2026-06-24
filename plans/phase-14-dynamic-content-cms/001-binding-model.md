---
task: 001
phase: 14
title: Dynamic Binding Model
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Dynamic Binding Model

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Extend the schema so a bindable node prop can hold either a static value or a **binding
descriptor** (source, field, fallback, format), and define how bindings serialize/validate.

## Context

This is the foundation for everything dynamic. A binding is a value-kind alongside raw values
and token references (Phase 11). The descriptor must be language-neutral so both PHP (front
end) and JS (preview) resolve it the same way.

## Requirements (Test Description)

- **Test:** Given a prop, it can hold a static value or a binding descriptor
  (source/field/fallback/format).
- **Test:** Given a binding, it validates (known source, field id, optional format/fallback).
- **Test:** Given serialization, bindings round-trip losslessly.
- **Test:** Given a non-bindable prop, bindings are rejected/ignored (defined behavior).

## Acceptance Criteria

- [ ] Binding descriptor type (source, field, fallback, format) in the schema.
- [ ] Validation + lossless serialization.
- [ ] A prop value is `static | token-ref | binding` (composes with Phase 11).
- [ ] Vitest covers model/validation/round-trip; lint/format/typecheck pass.

## Files to Create

- (edit) `app/document/schema/types.ts` — add the binding descriptor value-kind.
- `app/dynamic/binding.ts` — binding helpers + validation.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the descriptor serialization identical for PHP + JS resolvers (tasks 004/005).
- Mark which props are bindable per element (extend element definitions).
