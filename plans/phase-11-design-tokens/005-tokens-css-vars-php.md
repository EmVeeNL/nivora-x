---
task: 005
phase: 11
title: Tokens → CSS Custom Properties (PHP Generator)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 005 — Tokens → CSS Custom Properties (PHP Generator)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Extend the PHP CSS generator (Phase 10) to emit the token variables block and resolve token
references to `var(--nx-<id>)` on the front end, and regenerate the variables when tokens
change.

## Context

This is the front-end counterpart to task 004 and must produce identical output (verified by
the parity harness, task 007). Since tokens are global, the variables block is generated and
enqueued site-wide (or per page) and invalidated when tokens change.

## Requirements (Test Description)

- **Test:** Given the token set, the PHP generator emits the same variables block as the JS
  generator (parity).
- **Test:** Given a style prop referencing a token, the front-end rule uses `var(--nx-<id>)`.
- **Test:** Given a token change, the variables block is regenerated/invalidated and the front
  end reflects it.
- **Test:** Given a raw value, the literal is emitted (no variable).
- **Test:** Generation passes PHPCS + PHPStan.

## Acceptance Criteria

- [ ] PHP generator emits the token variables block matching the JS output.
- [ ] Token references resolve to `var(--nx-<id>)` on the front end.
- [ ] Variables regenerate/invalidate on token change (ties into the Phase 10 pipeline).
- [ ] Raw values stay literal.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- (edit) `src/Css/CssGenerator.php` — emit variables + resolve token refs.
- `src/Tokens/TokenCss.php` — token set → CSS variables (PHP).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Follow the same mapping as `app/tokens/cssVars.ts` (task 004); parity harness (007) enforces it.
- Hook token changes into the Phase 10 generate-on-save/invalidation pipeline.
- Decide variables-block scope (global enqueue vs per-document) and document it.
