---
task: 005
phase: 04
title: Undo / Redo History
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004]
retry_count: 0
---

# Task 005 — Undo / Redo History

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004
> **Retry count:** 0

## Description

Add an undo/redo history over the document store's mutations, with sensible coalescing of
rapid edits and standard keyboard shortcuts.

## Context

History is built into the store now (not retrofitted later) because every editor-batch
interaction depends on it. Continuous edits (e.g. dragging a slider) should coalesce into a
single history entry to avoid one-step-per-pixel undo.

## Requirements (Test Description)

- **Test:** Given a sequence of mutations, `undo` reverts them in reverse order and `redo`
  replays them.
- **Test:** Given a new mutation after undo, the redo stack is cleared.
- **Test:** Given rapid continuous edits to the same prop, they coalesce into one history
  entry.
- **Test:** Given shortcuts (Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z), undo/redo fire.
- **Test:** Selection is restored appropriately on undo/redo.

## Acceptance Criteria

- [ ] Undo/redo over all store mutations.
- [ ] Redo stack invalidated by new mutations.
- [ ] Coalescing of rapid continuous edits into single entries.
- [ ] Keyboard shortcuts wired (configurable).
- [ ] Selection restored sensibly across history steps.
- [ ] Vitest covers history behavior; lint/format/typecheck pass.

## Files to Create

- `app/document/history.ts` — undo/redo stack + coalescing.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Decide history granularity (per-op vs per-transaction) and expose a way to batch ops into
  one entry (used by sliders/drag in later phases).
- Keep history out of the persisted document — it's editor session state.
