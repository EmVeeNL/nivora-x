---
task: 001
phase: 11
title: Token Model, Storage & Defaults
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Token Model, Storage & Defaults

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Define the design-token model (Colors, Typography, Spacing, Effects) and site-wide storage,
seeded with a sensible default token set, exposed via typed accessors on both the PHP and
client sides.

## Context

Tokens are global (site-wide), mirroring the Phase 02 settings / Phase 09 breakpoint accessor
pattern. This model is the single source consumed by the manager UI (task 002), style
controls (003), and both CSS generators (004/005). Each token has a stable id so references
survive renames.

## Requirements (Test Description)

- **Test:** Given the model, a token has id, group (color/typography/spacing/effect), name,
  and value.
- **Test:** Given defaults, a seeded token set exists per group on first run.
- **Test:** Given CRUD via the accessor, tokens persist site-wide and reload.
- **Test:** Given the client + PHP accessors, both read the same token set (shape parity).
- **Test:** Token writes are sanitized + capability-gated.

## Acceptance Criteria

- [ ] Token model for Colors, Typography, Spacing, Effects with stable ids.
- [ ] Site-wide storage + typed PHP + client accessors.
- [ ] Seeded default token set.
- [ ] Sanitized, capability-gated writes.
- [ ] Pest + Vitest cover model/storage; all gates green.

## Files to Create

- `src/Tokens/Tokens.php` — PHP token storage + accessor.
- `app/tokens/model.ts` — token types.
- `app/tokens/store.ts` — client token accessor/store.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep ids opaque + stable; names are display-only (id-based references survive renames).
- Mirror the Phase 02/09 settings accessor pattern; one source for UI, controls, generators.
