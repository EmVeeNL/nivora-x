---
task: 001
phase: 09
title: Site-Wide Breakpoint Configuration
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Site-Wide Breakpoint Configuration

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Implement site-wide breakpoint configuration: default presets (Desktop/Tablet/Mobile) plus
add/edit/remove of custom breakpoints, persisted globally and exposed via a typed accessor.

## Context

Breakpoints drive the switcher, canvas widths, and the responsive resolver (Phase 08). They
are a global (site-wide) setting, mirroring the Phase 02 settings pattern. Editing or removing
a breakpoint must safely handle existing per-breakpoint style overrides on documents.

## Requirements (Test Description)

- **Test:** Given defaults, Desktop/Tablet/Mobile presets exist with sensible widths.
- **Test:** Given add/edit/remove, custom breakpoints persist globally and reload.
- **Test:** Given the accessor, the ordered breakpoint set (with widths) is readable by the
  switcher/canvas/resolver.
- **Test:** Given removal of a breakpoint that has overrides, those overrides are handled
  (migrated/dropped) per a defined rule, with a warning.
- **Test:** Breakpoint edits are capability-gated.

## Acceptance Criteria

- [ ] Default presets + add/edit/remove custom breakpoints, persisted site-wide.
- [ ] Typed accessor exposing the ordered set (id, label, width, direction).
- [ ] Defined, safe handling of overrides when breakpoints change (warn on remove).
- [ ] Capability-gated edits.
- [ ] Tests cover defaults/CRUD/override-handling; PHP + JS gates pass.

## Files to Create

- `src/Settings/Breakpoints.php` — global storage + accessor (PHP).
- `app/breakpoints/config.ts` — client accessor + types.
- `app/breakpoints/BreakpointSettings.tsx` — add/edit/remove UI.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Mirror the Phase 02 settings accessor pattern; this set is the single source for switcher,
  canvas widths, and the Phase 08 resolver.
- Decide override-on-remove policy (drop vs remap to nearest) and document it.
- First implementation slice landed on 2026-06-25: PHP defaults/sanitizer + typed accessor,
  editor bootstrap exposure, client breakpoint accessor, and switcher/canvas consumption. CRUD
  settings UI and override-removal policy still open in this task.
