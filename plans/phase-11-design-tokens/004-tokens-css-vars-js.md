---
task: 004
phase: 11
title: Tokens → CSS Custom Properties (JS Generator)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 004 — Tokens → CSS Custom Properties (JS Generator)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Extend the JS CSS generator (Phase 10) to emit the token set as CSS custom properties and to
resolve token references in style props to `var(--nx-<id>)` — the editor-side fill of the
Phase 10 token seam.

## Context

CSS custom properties make token propagation cheap: emit a variables block once; style rules
reference the variables. Editing a token updates the variable and cascades to all referencing
nodes live in the editor iframe.

## Requirements (Test Description)

- **Test:** Given the token set, the JS generator emits a variables block (`--nx-<id>: value`).
- **Test:** Given a style prop referencing a token, the generated rule uses `var(--nx-<id>)`.
- **Test:** Given a token value change, the variables block updates and the canvas reflects it
  live (no per-node regeneration needed).
- **Test:** Given a raw value (no token), the rule uses the literal value.
- **Test:** Output is deterministic and matches the Phase 10 generation rules.

## Acceptance Criteria

- [x] JS generator emits the token variables block.
- [x] Token references resolve to `var(--nx-<id>)`; raw values stay literal.
- [x] Editing a token cascades live via the variable (cheap propagation).
- [x] Deterministic output consistent with Phase 10 rules.
- [x] Vitest covers variable emission + reference resolution; lint/format/typecheck pass.

## Files to Create

- (edit) `app/css/generate.ts` — emit variables block + resolve token refs.
- `app/tokens/cssVars.ts` — token set → CSS variables mapping.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- This implements the Phase 10 `app/css/rules.ts` token seam — the PHP side (task 005) must
  match it.
- Inject the variables block at the iframe root so editor canvas styling cascades.
