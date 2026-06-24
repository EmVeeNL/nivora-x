---
task: 007
phase: 04
title: Autosave & Status Signal
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [006]
retry_count: 0
---

# Task 007 — Autosave & Status Signal

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 006
> **Retry count:** 0

## Description

Add debounced autosave of work-in-progress and expose an autosave **status signal**
(idle / saving / saved / error) for the top-bar indicator that Phase 09 will render.

## Context

Autosave protects against lost work without the user pressing save. It must not fight manual
Save draft / Publish (task 006) — a single persistence queue serializes them. The status is
exposed as a signal only; the actual indicator UI (and the "no layout shift" requirement) is
implemented where it's rendered, in Phase 09.

## Requirements (Test Description)

- **Test:** Given edits, autosave triggers after a debounce interval and persists the
  current document.
- **Test:** Given no changes, autosave does not fire (no redundant writes).
- **Test:** Given a manual save/publish in flight, autosave does not race or duplicate (a
  single queue serializes writes).
- **Test:** Given autosave lifecycle, the status signal transitions idle → saving → saved
  (and → error on failure).
- **Test:** Autosave entries don't pollute published content (separate from Publish).

## Acceptance Criteria

- [ ] Debounced autosave that only fires on actual changes.
- [ ] Single persistence queue shared with manual save/publish (no races).
- [ ] Observable status signal: idle/saving/saved/error.
- [ ] Autosave is distinct from Publish (work-in-progress only).
- [ ] Vitest covers debounce/queue/status; lint/format/typecheck pass.

## Files to Create

- `app/document/autosave.ts` — debounced autosave + status signal + write queue.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- The status signal is the contract Phase 09's indicator consumes — keep its shape stable.
- Coordinate with WP autosave/revisions expectations (decide whether autosave updates the
  draft envelope vs a separate autosave slot); document the choice.
- Reserve the indicator's space in the toolbar now (noted in Phase 03 task 003) so Phase 09
  adds it without layout shift.
