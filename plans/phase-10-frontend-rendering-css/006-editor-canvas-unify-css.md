---
task: 006
phase: 10
title: Unify Editor Canvas onto Generated CSS
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 006 — Unify Editor Canvas onto Generated CSS

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Switch the editor canvas from the Phase 08 inline-style applier to the JS-generated CSS
(task 003) injected into the Phase 05 iframe, so the editor renders identically to the front
end and updates live as the user edits.

## Context

The Phase 08 seam was built to be replaced here. Using the same generation rules in-editor
(live) guarantees WYSIWYG parity with the cached PHP front-end output. The editor regenerates
CSS on edits (the PHP cache only updates on save), so the JS generator drives the canvas.

## Requirements (Test Description)

- **Test:** Given style edits, the canvas updates via injected generated CSS (not inline
  styles).
- **Test:** Given the same document, the editor's injected CSS matches the front-end CSS
  for fixtures.
- **Test:** Given the active breakpoint, the canvas reflects the resolved cascade via the
  generated CSS.
- **Test:** The Phase 08 inline applier is removed/retired with no regressions.
- **Test:** Style isolation in the iframe still holds.

## Acceptance Criteria

- [ ] Editor canvas renders via JS-generated CSS injected into the iframe.
- [ ] Phase 08 inline applier removed; no visual regressions.
- [ ] Editor CSS matches front-end CSS for shared fixtures.
- [ ] Live updates on edits; breakpoint cascade honored.
- [ ] Vitest covers injection/parity; lint/format/typecheck pass.

## Files to Create

- `app/canvas/style/injectGeneratedCss.ts` — generate + inject CSS into the iframe.
- (edit) `app/canvas/style/applyStyles.ts` — retire the inline applier (or delegate).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Regenerate + re-inject on document changes (debounced); keep it performant on large trees.
- This closes the editor↔front-end parity loop; verify with the task-007 fixtures.
