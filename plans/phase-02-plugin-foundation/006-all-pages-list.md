---
task: 006
phase: 02
title: All Pages Screen — Native List Augmentation
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003, 004]
retry_count: 0
---

# Task 006 — All Pages Screen — Native List Augmentation

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003, 004
> **Retry count:** 0

## Description

Make the NivoraX "All Pages" screen show the native pages list augmented with a NivoraX
indicator column and a filter for "built with NivoraX", so users can find and manage
NivoraX-edited content.

## Context

Per the augment model, NivoraX doesn't own a separate page entity — "All Pages" surfaces
native posts with NivoraX state layered on. The NivoraX indicator derives from the
editor-mode flag (task 004). The filter lets users narrow to NivoraX pages. Reuses the
enabled-types setting (002) to decide which content is in scope.

## Requirements (Test Description)

- **Test:** Given the All Pages screen, it lists native pages (of enabled post types).
- **Test:** Given a NivoraX-mode page, a column/badge marks it as built with NivoraX;
  a default-mode page does not get the badge.
- **Test:** Given the "built with NivoraX" filter, the list narrows to NivoraX-mode posts.
- **Test:** Row actions include "Edit with NivoraX" (from task 003) on enabled types.

## Acceptance Criteria

- [ ] All Pages shows native pages for enabled post types.
- [ ] A NivoraX indicator column/badge reflects the editor-mode flag.
- [ ] A working filter for NivoraX-built content.
- [ ] Reuses task 003 affordances and the task 002 enabled-types accessor.
- [ ] Passes PHPCS + PHPStan; covered by tests.

## Files to Create

- `src/Admin/Screen/AllPagesScreen.php` — (extend the task-001 stub) list + column + filter.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Prefer reusing `WP_List_Table`/native query plumbing over rebuilding a list UI.
- Decide whether "All Pages" defaults to the `page` type with a type switcher, or shows all
  enabled types together — keep it simple; document the choice.
