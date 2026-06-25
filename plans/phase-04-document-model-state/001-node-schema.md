---
task: 001
phase: 04
title: Node-Tree Schema & TypeScript Types
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Node-Tree Schema & TypeScript Types

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Define the node-tree schema and its TypeScript types: the node shape (`id`, `type`,
`props`, `children`, per-breakpoint responsive `overrides`, metadata) wrapped in a versioned
document envelope.

## Context

This schema is the editor's source of truth and the foundation for every editor-batch
phase. TypeScript types are authoritative this batch; PHP value objects + render parity come
in the front-end batch (Phase 10), so the serialized shape must be stable and language-
neutral. The element *catalog* (which `type`s exist) is Phase 05 — here `props` is a
loosely-typed open map.

## Requirements (Test Description)

- **Test:** Given the types, a valid node tree (nested children, overrides, metadata) is
  representable and type-checks.
- **Test:** Given the envelope type, it carries `version` + `tree` and matches the Phase 02
  storage contract shape.
- **Test:** Given responsive props, the `{ base, <breakpoint>: value }` shape is expressible
  for a styleable prop.
- **Test:** The types compile under strict TS incl. `noUncheckedIndexedAccess`.

## Acceptance Criteria

- [ ] Node type: `id`, `type`, `props` (open map), `children`, responsive `overrides`,
      metadata (name, visibility, lock).
- [ ] Versioned document envelope type aligning with the Phase 02 contract.
- [ ] Responsive value shape defined once and reused.
- [ ] Strict TS clean; lint/format pass.

## Files to Create

- `app/document/schema/types.ts` — node + envelope + responsive value types.
- `app/document/schema/constants.ts` — current schema version + shared constants.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the serialized JSON shape identical to what Phase 10's PHP will mirror — avoid
  TS-only constructs in the wire format.
- `props` stays open until Phase 05 introduces per-element prop schemas.
