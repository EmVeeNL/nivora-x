---
task: 008
phase: 09
title: Tests & Polish (Responsive E2E)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 004, 005, 006, 007]
retry_count: 0
---

# Task 008 — Tests & Polish (Responsive E2E)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003, 004, 005, 006, 007
> **Retry count:** 0

## Description

Round out coverage for the responsive + top-bar features with an end-to-end responsive-edit
flow, and polish the experience. Closes the editor batch.

## Context

This is the final task of the editor batch. After it, the editor supports create → compose →
style → responsive → save/publish/preview. The E2E flow proves responsive editing works
through the real stack; front-end output follows in Phase 10.

## Requirements (Test Description)

- **Test (E2E):** Switch to a narrower breakpoint, change a style, confirm the override
  applies at that breakpoint and the desktop base is unchanged, then save.
- **Test:** Inherited/overridden indicators + reset behave across breakpoints.
- **Test:** Save/Publish + autosave indicator + Preview behave together without conflicts or
  layout shift.
- **Test:** `pnpm lint`, `format:check`, `typecheck`, `build`, Vitest, and the E2E spec pass.

## Acceptance Criteria

- [x] E2E responsive-edit happy path green.
- [x] Indicators/reset, save/publish, autosave, and preview verified together.
- [x] Visual polish consistent with the reference across breakpoints.
- [x] All JS gates green; editor batch complete.

## Files to Create

- `e2e/responsive-edit.spec.ts` — responsive editing E2E happy path.
- `app/breakpoints/__tests__/` — resolver/cascade tests (as needed).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Re-verify the cascade fixtures here — they're the contract Phase 10's CSS generation must
  match for React↔PHP parity.
- This closes Phases 04–09; the editor is end-to-end usable (front-end output is Phase 10).
