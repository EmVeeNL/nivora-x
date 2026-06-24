---
task: 001
phase: 02
title: Top-Level Admin Menu & Screen Routing
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Top-Level Admin Menu & Screen Routing

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Register the top-level **NivoraX** admin menu with its sub-screens (All Pages, New Page,
Settings) and the routing/scaffolding that renders each screen's container.

## Context

This is the entry point for the entire plugin admin surface; tasks 002–009 fill the
screens this task registers. Builds on the Phase 01 plugin skeleton (`NivoraX\Plugin`
bootstrap). Screens are empty containers here — their real content arrives in later
tasks. Menu and screens must be capability-gated (full gating detailed in task 003).

## Requirements (Test Description)

- **Test:** Given an admin user, a top-level "NivoraX" menu appears with submenus
  All Pages, New Page, Settings.
- **Test:** Given each submenu, its screen callback renders without PHP notices and
  outputs its container markup.
- **Test:** Given a user lacking the required capability, the menu/screens are not
  registered/accessible.
- **Test:** Menu registration hooks on `admin_menu` and does not run on the front end.

## Acceptance Criteria

- [ ] Top-level NivoraX menu registered with an icon and position.
- [ ] Submenus: All Pages, New Page, Settings, each routed to a screen callback.
- [ ] Screen callbacks render a container (no fatal/notice) ready for later tasks.
- [ ] Registration is capability-gated and admin-only.
- [ ] Code passes PHPCS + PHPStan.

## Files to Create

- `src/Admin/Menu.php` — registers the menu + submenus.
- `src/Admin/Screen/AllPagesScreen.php` — container stub.
- `src/Admin/Screen/NewPageScreen.php` — container stub.
- `src/Admin/Screen/SettingsScreen.php` — container stub.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep screen classes thin; they're containers wired up by later tasks (002, 006, 007).
- Decide the menu icon (dashicon or inline SVG) and slug prefix (`nivorax`) now — reused
  throughout the plugin.
