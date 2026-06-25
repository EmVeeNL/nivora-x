---
task: 003
phase: 08
title: Block Tab — Per-Element Content Schemas
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 002]
retry_count: 0
---

# Task 003 — Block Tab — Per-Element Content Schemas

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 002
> **Retry count:** 0

## Description

Define the Block-tab content control schemas for the starter elements (Section, Container,
Heading, Text) so the selected element's content props are editable.

## Context

The Block tab edits element-specific content (e.g. Heading text + level, Text content, link
settings, Container layout-ish content props). Schemas are declared on the element
definitions (Phase 05 slot) and rendered by the task-001 system. This proves the declarative
approach end to end for content props.

## Requirements (Test Description)

- **Test:** Given each starter element selected, the Block tab shows its content controls.
- **Test:** Given an edit (e.g. Heading text/level), the node prop updates and the canvas
  re-renders.
- **Test:** Given Heading/Text, their text prop is editable from the Block tab (no inline
  canvas editing this phase).
- **Test:** Schemas live on the element definitions (data-driven), not bespoke components.

## Acceptance Criteria

- [ ] Block content schemas for Section, Container, Heading, Text on their definitions.
- [ ] Editing content props updates nodes via the store and re-renders the canvas.
- [ ] Heading level / text and Text content editable via controls.
- [ ] Fully data-driven (no per-element bespoke UI).
- [ ] Vitest covers schema-driven content editing; lint/format/typecheck pass.

## Files to Create

- (edit) `app/elements/definitions/*.ts` — add Block control schemas to each starter element.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep content props distinct from style props (Inspector tab, task 004).
- Heading level options (h1–h6) and Text as a plain string for now; rich text is a later phase.
