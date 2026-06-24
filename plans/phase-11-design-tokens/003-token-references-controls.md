---
task: 003
phase: 11
title: Token References in Style Controls
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 003 — Token References in Style Controls

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Make the Phase 08 foundational style controls token-aware: color/spacing/typography/effect
controls can take a **token reference** or a **raw value**, with the reference stored by
token id on the node's style prop.

## Context

This connects tokens to actual styling. Storing references by id (not the resolved value) is
what lets a global token edit cascade. Controls need a clear affordance to pick a token or
enter a raw value, and to show which is active.

## Requirements (Test Description)

- **Test:** Given a color control, the user can pick a color token or enter a raw color; the
  choice persists on the node's style prop.
- **Test:** Given a token reference, the stored value is the token id (not the resolved color).
- **Test:** Given spacing/typography/effect controls, each can reference the appropriate token
  group or a raw value.
- **Test:** Given a control bound to a token, it indicates the token (name) vs a raw value.
- **Test:** Switching from token to raw value (and back) works and persists.

## Acceptance Criteria

- [ ] Color/spacing/typography/effect controls accept a token reference or raw value.
- [ ] References stored by token id on style props.
- [ ] Clear token-vs-raw indication in the control.
- [ ] Token group filtered to the relevant control (colors for color, etc.).
- [ ] Vitest covers token-or-value binding; lint/format/typecheck pass.

## Files to Create

- `app/inspector/controls/TokenOrValue.tsx` — token/raw-value picker wrapper.
- (edit) `app/inspector/style/` — make foundational controls token-aware.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 08 value/unit model; a token reference is a distinct value kind alongside
  raw values.
- The resolved CSS uses `var(--nx-<id>)` (tasks 004/005) — the control stores the id; resolution
  happens in the generators.
