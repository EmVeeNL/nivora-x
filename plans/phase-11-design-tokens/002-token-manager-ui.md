---
task: 002
phase: 11
title: Token Manager UI
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Token Manager UI

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the token manager UI (reference screenshot 03): create, edit, and delete tokens grouped
by category (Colors, Typography, Spacing, Effects).

## Context

This is the user-facing surface for the token model (task 001). It must be approachable and
group tokens clearly. Delete/rename safety (reference integrity) is handled in task 006; here
it's the CRUD surface and presentation.

## Requirements (Test Description)

- **Test:** Given the manager, tokens render grouped by category with their values previewed
  (e.g. color swatches).
- **Test:** Given create/edit/delete, the token set updates and persists (via task 001).
- **Test:** Given a value edit (e.g. a color), the preview updates.
- **Test:** Given many tokens, the UI stays usable (search/scroll as needed).

## Acceptance Criteria

- [ ] Grouped token list (Colors/Typography/Spacing/Effects) with value previews.
- [ ] Create/edit/delete persisting via the task-001 accessor.
- [ ] Sensible presentation per token type (swatches, type samples, spacing values).
- [ ] Vitest covers CRUD wiring; lint/format/typecheck pass.

## Files to Create

- `app/tokens/manager/TokenManager.tsx` — manager shell + groups.
- `app/tokens/manager/TokenEditor.tsx` — create/edit a token.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Where the manager lives (a NivoraX admin screen vs an editor panel) — decide and document;
  the screenshot suggests a dedicated screen.
- Defer delete/rename safety to task 006; keep this focused on CRUD + presentation.
- **Font-family picker (Typography section):** query `GET /wp/v2/fonts` (WordPress Font
  Library, WP 7.0) and merge with a static fallback list (Arial, Helvetica, Georgia, Times
  New Roman, Verdana, Courier New, `system-ui`, `sans-serif`, `serif`, `monospace`). Show
  a searchable dropdown with a live preview of the selected family. WP Font Library handles
  `@font-face` registration; no custom font-downloading logic needed here.
