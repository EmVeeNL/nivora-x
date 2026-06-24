---
task: 003
phase: 12
title: Border & Box-shadow Controls
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 003 — Border & Box-shadow Controls

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add Border (width/style/color, per-side), border-radius, and box-shadow controls — declarative,
token-aware, and state-aware.

## Context

Borders, radius, and shadows are core to the reference inspector and pair naturally with the
Effects tokens (Phase 11). All three honor the state dimension (e.g. hover shadow).

## Requirements (Test Description)

- **Test:** Given Border controls, width/style/color (per-side) write style props.
- **Test:** Given border-radius, per-corner values apply.
- **Test:** Given box-shadow, offset/blur/spread/color (and inset) apply.
- **Test:** Given Effects tokens, border color / radius / shadow can reference them.
- **Test:** Given a state, these can be set per state; canvas + CSS reflect it.

## Acceptance Criteria

- [ ] Border (per-side width/style/color), border-radius (per-corner), box-shadow controls.
- [ ] Token-aware (Effects/colors) + state-aware.
- [ ] Reflected in canvas + generated CSS.
- [ ] Vitest covers the controls; lint/format/typecheck pass.

## Files to Create

- `app/inspector/style/border/` — border + radius + shadow control group.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Support linked/unlinked per-side and per-corner editing (common builder UX).
- Keep shadow + border value models serializable for both CSS generators.
