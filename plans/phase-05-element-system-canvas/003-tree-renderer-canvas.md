---
task: 003
phase: 05
title: React Tree Renderer in the iframe Canvas
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 002]
retry_count: 0
---

# Task 003 — React Tree Renderer in the iframe Canvas

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 002
> **Retry count:** 0

## Description

Build the React renderer that walks the Phase 04 document tree and renders it into the
Phase 03 iframe canvas, using each element's render component with structural default
styling, plus an empty-state placeholder when the document has no nodes.

## Context

This replaces the Phase 03 empty iframe scaffold with live rendering driven by the store.
It renders into the iframe document (the Phase 03 seam) so canvas styling stays isolated
from the editor chrome. Real user styling and front-end/PHP parity are later phases; here
elements use their intrinsic structural styles.

## Requirements (Test Description)

- **Test:** Given a document tree, the renderer outputs the corresponding DOM in the iframe,
  including nested Section → Container → Heading/Text.
- **Test:** Given store mutations (insert/move/update/remove), the canvas re-renders to match.
- **Test:** Given an unknown element type, it renders the safe placeholder (no crash).
- **Test:** Given an empty document, an empty-state placeholder/drop hint renders.
- **Test:** Editor chrome styles do not leak into the iframe (isolation holds).

## Acceptance Criteria

- [ ] Recursive renderer maps nodes → element render components inside the iframe.
- [ ] Live updates on store changes.
- [ ] Safe placeholder for unknown types; empty-state for empty documents.
- [ ] Structural default styling only; isolation from chrome verified.
- [ ] Vitest covers render output + reactivity; lint/format/typecheck pass.

## Files to Create

- `app/canvas/CanvasRenderer.tsx` — recursive tree → DOM renderer (in-iframe).
- `app/canvas/EmptyState.tsx` — empty-document placeholder.
- `app/canvas/renderNode.tsx` — single-node render dispatch via the registry.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Render into the iframe via the Phase 03 `iframe.ts` seam; memoize per node (key by id).
- Keep DOM structure clean/semantic — Phase 10's PHP renderer will mirror it, so decisions
  here inform the future markup contract.
