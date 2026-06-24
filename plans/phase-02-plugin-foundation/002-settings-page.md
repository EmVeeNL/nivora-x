---
task: 002
phase: 02
title: Settings Page & Enabled Post Types
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Settings Page & Enabled Post Types

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the NivoraX Settings screen using the WordPress Settings API, including the core
setting that drives the rest of the plugin: **which post types NivoraX is enabled on**
(Pages, Posts, and public CPTs), plus a couple of placeholder general options.

## Context

The enabled-post-types setting is the single source consulted by post-type integration
(003), the All Pages list (006), and the front-end switch (009). It must enumerate public
post types dynamically so custom CPTs appear. Keep general options minimal — the pattern
matters more than the option count right now.

## Requirements (Test Description)

- **Test:** Given the Settings screen, registered settings/sections/fields render via the
  Settings API and save through `options.php` without notices.
- **Test:** Given the post-types field, all public post types (incl. a registered test
  CPT) are listed as toggles; saving persists the selected set.
- **Test:** Given a helper (e.g. `is_enabled_for( $post_type )`), it returns true only for
  saved-enabled post types.
- **Test:** Given saving, values are sanitized (only valid public post-type slugs stored).

## Acceptance Criteria

- [ ] Settings registered via the Settings API (setting, sections, fields).
- [ ] Enabled-post-types control lists public post types dynamically and persists.
- [ ] A typed accessor exposes the enabled set + an `is_enabled_for()` helper.
- [ ] Inputs are sanitized/validated on save.
- [ ] A couple of placeholder general options exist to prove the pattern.
- [ ] Passes PHPCS + PHPStan; covered by tests.

## Files to Create

- `src/Admin/Settings/SettingsPage.php` — Settings API registration + render.
- `src/Settings/Settings.php` — typed read accessor (`is_enabled_for()`, getters).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Centralize the option key + defaults; tasks 003/006/009 read through the accessor, never
  the raw option.
- Exclude non-public/built-in-irrelevant post types (e.g. attachments) from the toggle list.
