---
task: 005
phase: 12
title: Advanced Layout Controls (Flex/Grid)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 005 — Advanced Layout Controls (Flex/Grid)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add full flexbox and grid layout controls — alignment, justification, wrap, gap, direction
(flex) and templates/areas/auto-flow (grid) — extending the Phase 08 foundational Layout group.

## Context

Phase 08 shipped basic layout; this adds the complete flex/grid toolset for Section/Container
elements. These are the controls that make complex responsive layouts possible, so they're
especially important across breakpoints (Phase 09) and states (Phase 12 task 001).

## Requirements (Test Description)

- **Test:** Given flex controls, direction/wrap/justify/align/gap write style props and apply.
- **Test:** Given grid controls, template columns/rows/areas/gap/auto-flow apply.
- **Test:** Given a container element, child-relevant controls (e.g. align-items) apply to the
  container; item-level controls (e.g. flex-grow) apply to children where appropriate.
- **Test:** Given breakpoints/states, layout values can vary; canvas + CSS reflect them.

## Acceptance Criteria

- [ ] Full flex controls (direction/wrap/justify/align/gap).
- [ ] Full grid controls (templates/areas/auto-flow/gap).
- [ ] Container vs item-level controls applied to the right node.
- [ ] Breakpoint- + state-aware; reflected in canvas + generated CSS.
- [ ] Vitest covers controls; lint/format/typecheck pass.

## Files to Create

- `app/inspector/style/layout/` — advanced flex/grid control group.
- (edit) `app/elements/definitions/section.ts`, `container.ts` — expose layout controls.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Decide how item-level layout props (flex-grow/order, grid placement) attach to child nodes —
  likely style props on the child, edited when the child is selected.
- Reconcile with the Phase 08 foundational Layout group (extend, don't duplicate).
