---
task: 005
phase: 08
title: Editor-Side Style Application (Resolver Seam)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004]
retry_count: 0
---

# Task 005 — Editor-Side Style Application (Resolver Seam)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004
> **Retry count:** 0

## Description

Apply style props to the canvas so edits render live: a **resolver** that picks a node's
style values for the active breakpoint, and an **applier** that sets them as inline styles on
the rendered element — both behind a seam that Phase 10 replaces with generated CSS.

## Context

The full CSS-generation engine (scoped classes + media queries) is Phase 10. Until then, the
editor renders one breakpoint at a time, so resolving style props for the active breakpoint
and applying them inline is sufficient and correct in-editor. Keeping this behind a clear
seam means Phase 10 swaps the implementation without touching controls or elements.

## Requirements (Test Description)

- **Test:** Given a node with base style props, the resolver returns the active-breakpoint
  values and the canvas reflects them.
- **Test:** Given a style edit, the canvas updates live.
- **Test:** Given the active breakpoint = desktop (this phase), resolution returns base
  values (the cascade is exercised in Phase 09).
- **Test:** The resolver + applier are exposed behind a documented seam/interface.
- **Test:** Editor chrome isolation still holds (styles applied inside the iframe only).

## Acceptance Criteria

- [ ] Resolver: node style props → active-breakpoint values.
- [ ] Applier: resolved values → inline styles on the rendered element.
- [ ] Live canvas updates on edits.
- [ ] Implemented behind a seam Phase 10 can replace with generated CSS.
- [ ] Vitest covers resolve/apply; lint/format/typecheck pass.

## Files to Create

- `app/canvas/style/resolveStyles.ts` — active-breakpoint resolver (seam).
- `app/canvas/style/applyStyles.ts` — inline applier (seam).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Define the resolver's cascade order now (desktop-first) so Phase 09 extends it and Phase 10
  mirrors it; capture shared fixtures.
- Apply inside the iframe document only — keep editor-chrome styling separate.
