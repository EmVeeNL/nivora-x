---
task: 006
phase: 08
title: Page Tab — Page Settings
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 006 — Page Tab — Page Settings

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Build the Page tab: page-level settings — starting with the page **title** and a couple of
basics — persisted via the Phase 04/02 persistence.

## Context

Unlike Block/Inspector (node-scoped), the Page tab is document-scoped. The title maps to the
WordPress post title; other basics may live in the document envelope or post fields. This
gives users a place to set page-level info without leaving the editor.

## Requirements (Test Description)

- **Test:** Given the Page tab, the title field shows the current page title and edits update
  it.
- **Test:** Given a title change, it persists (Save draft/Publish) and reloads correctly.
- **Test:** Given a couple of basic page settings, they persist and reload.
- **Test:** Page settings are document-scoped (independent of node selection).
- **Test:** Changes are capability-gated through the persistence layer.

## Acceptance Criteria

- [ ] Page tab with title + a couple of basic page settings.
- [ ] Title maps to the post title; persists via Phase 04/02 persistence.
- [ ] Document-scoped (selection-independent).
- [ ] Reloads correctly after save.
- [ ] Vitest (client) covers binding/persistence wiring; lint/format/typecheck pass.

## Files to Create

- `app/inspector/page/PageSettings.tsx` — page-level settings form.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Decide where each basic setting persists (post field vs document envelope) and document it.
- Title round-trips through the same persistence used for the document (Phase 04 task 006).
