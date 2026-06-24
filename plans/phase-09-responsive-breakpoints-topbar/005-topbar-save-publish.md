---
task: 005
phase: 09
title: Top Bar — Save Draft & Publish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 005 — Top Bar — Save Draft & Publish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** []
> **Retry count:** 0

## Description

Wire the top bar's Save draft and Publish buttons to the Phase 04 persistence actions, with
appropriate in-progress/disabled states and result feedback.

## Context

Phase 03 shipped visual Save/Publish placeholders; Phase 04 implemented the persistence
actions (Save draft vs Publish). This task connects them and gives clear UI feedback. Publish
marks the document live so the Phase 02 front-end switch will render it (real output in
Phase 10).

## Requirements (Test Description)

- **Test:** Given Save draft, the document persists via the Phase 04 draft action and the
  button reflects in-progress → done.
- **Test:** Given Publish, the document persists and is marked live via the Phase 04 publish
  action.
- **Test:** Given an in-flight save, buttons disable/indicate to prevent double-submits.
- **Test:** Given a save error, the user gets clear feedback and can retry.
- **Test:** Actions are capability-gated through the persistence layer.

## Acceptance Criteria

- [ ] Save draft + Publish wired to the Phase 04 persistence actions.
- [ ] In-progress/disabled states; success + error feedback.
- [ ] Publish marks the document live (front-end switch reads it).
- [ ] Vitest covers wiring/states; lint/format/typecheck pass.

## Files to Create

- (edit) `app/shell/TopToolbar.tsx` — wire Save/Publish to persistence actions.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Call the Phase 04 store persistence actions directly — no new persistence logic here.
- Coordinate with autosave (task 006) so manual + auto saves share the single write queue.
