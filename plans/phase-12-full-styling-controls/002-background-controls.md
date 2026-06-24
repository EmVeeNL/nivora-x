---
task: 002
phase: 12
title: Background Controls
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Background Controls

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add Background controls — color, gradient, and image (position/size/repeat) — as declarative,
token-aware, state-aware style controls.

## Context

Background is a core styling group from the reference inspector. Controls use the Phase 08
schema system, the Phase 11 token-or-value affordance (for colors), and the Phase 12 state
dimension (per-state backgrounds, e.g. hover background color).

## Requirements (Test Description)

- **Test:** Given the Background group, color/gradient/image controls render and write style
  props.
- **Test:** Given a color/gradient, it can reference a token or a raw value.
- **Test:** Given an image, position/size/repeat options apply.
- **Test:** Given a state (e.g. hover), a background value can be set per state.
- **Test:** Canvas + generated CSS reflect the background (incl. per-state).

## Acceptance Criteria

- [ ] Background color, gradient, and image controls (declarative).
- [ ] Token-aware color/gradient (Phase 11) and state-aware (Phase 12 task 001).
- [ ] Image position/size/repeat options.
- [ ] Reflected in canvas + generated CSS.
- [ ] Vitest covers the controls; lint/format/typecheck pass.

## Files to Create

- `app/inspector/style/background/` — background control group.
- (edit) `app/elements/definitions/*.ts` — expose background controls where relevant.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Background image source ties to media later (Phase 17); for now accept a URL + (optional)
  media-id seam.
- Gradient model should serialize cleanly for both CSS generators (task 006 / Phase 10).
