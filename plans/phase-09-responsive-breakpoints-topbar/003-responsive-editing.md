---
task: 003
phase: 09
title: Desktop-First Responsive Editing
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 003 — Desktop-First Responsive Editing

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Make the Phase 08 style controls responsive: when editing at a non-desktop breakpoint, write
a per-breakpoint **override** (desktop-first), and extend the resolver to apply the cascade
across configured breakpoints.

## Context

Style props already use the `{ base, <bp>: v }` shape (Phase 04); Phase 08 edited `base`
(desktop). This task routes edits to the active breakpoint's override and resolves values
desktop-first (base = desktop; narrower breakpoints override downward) — the same order
Phase 10's CSS generation must mirror.

## Requirements (Test Description)

- **Test:** Given the active breakpoint = desktop, control edits write the base value.
- **Test:** Given a narrower active breakpoint, control edits write an override at that
  breakpoint (base unchanged).
- **Test:** Given resolution at a breakpoint, values cascade desktop→down to the active
  breakpoint correctly.
- **Test:** Given an override removed, the value falls back to the inherited (wider) value.
- **Test:** Canvas reflects the resolved value at the active breakpoint.

## Acceptance Criteria

- [ ] Control edits target base (desktop) or the active breakpoint override accordingly.
- [ ] Resolver applies the desktop-first cascade across configured breakpoints.
- [ ] Removing an override falls back to the inherited value.
- [ ] One canonical cascade order (shared fixtures for Phase 10 parity).
- [ ] Vitest covers write-target + cascade + fallback; lint/format/typecheck pass.

## Files to Create

- `app/breakpoints/resolveResponsive.ts` — desktop-first cascade resolver (extends Phase 08 seam).
- (edit) `app/inspector/controls/ControlRenderer.tsx` — route writes to base vs active override.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Extend the Phase 08 resolver seam rather than forking it; Phase 10 implements the same
  cascade as CSS (max-width media queries).
- Capture golden fixtures of resolution so editor + Phase 10 stay in agreement.
- Completed on 2026-06-25: responsive edits now target base vs active breakpoint override, and
  canvas/style resolution follows the configured desktop-first cascade across the live configured
  breakpoint set.
