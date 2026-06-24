---
task: 004
phase: 01
title: Minimal Plugin Skeleton
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 004 — Minimal Plugin Skeleton

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Create the smallest valid, activatable WordPress plugin: a main file with a proper
header, Composer PSR-4 autoloading, a bootstrap class, and activation/deactivation
hooks. No product features — just the anchor every tooling and test task runs against.

## Context

PHPCS, PHPStan, and Pest (tasks 005–006) and the Vite enqueue integration (task 008)
all need real code to operate on. This skeleton is that surface. It establishes the
namespace (`NivoraX\`), the source layout (`src/`, PSR-4), the text domain, and the
minimum metadata required by WordPress 7.0 / PHP 8.5. Keep it lean: a single `Plugin`
class booted from the main file, plus activation/deactivation/uninstall hooks that do
nothing meaningful yet.

## Requirements (Test Description)

- **Test:** Given the plugin in a WP install, `wp plugin activate nivorax` succeeds with
  zero PHP notices/warnings/deprecations.
- **Test:** Given `composer dump-autoload`, classes under `NivoraX\` resolve from
  `src/` via PSR-4 (autoload map generated).
- **Test:** Given the main file, the WordPress plugin header parses (name, version,
  requires PHP 8.5, requires WP 7.0, license GPLv2+, text domain `nivorax`).
- **Test:** Activating then deactivating the plugin runs the hooks without error and
  leaves no fatal state.

## Acceptance Criteria

- [ ] `nivorax.php` main file with a complete, standards-compliant plugin header.
- [ ] `composer.json` declares PSR-4 `NivoraX\` → `src/` and the runtime PHP 8.5
      constraint.
- [ ] `src/Plugin.php` bootstrap class (singleton/boot pattern) loaded from the main
      file via the Composer autoloader.
- [ ] Activation/deactivation hooks registered (no-op but present and safe).
- [ ] `uninstall.php` present (no-op/clean stub).
- [ ] Direct-access guard (`defined('ABSPATH')`) in PHP entrypoints.
- [ ] Activates cleanly with no notices.

## Files to Create

- `nivorax.php` — main plugin file + header, boots `NivoraX\Plugin`.
- `composer.json` — PSR-4 autoload, PHP constraint (dev deps added in task 005/006).
- `src/Plugin.php` — bootstrap class.
- `uninstall.php` — uninstall stub.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Namespace `NivoraX\`, text domain `nivorax`, slug/dir `nivorax` — keep these constant
  across the codebase; they're referenced by provisioning (003) and assets (008).
- Guard the autoloader require (`vendor/autoload.php`) so a missing `composer install`
  fails loudly with a helpful admin notice rather than a white screen.
- Define a single version constant in the main file and reuse it (asset versioning,
  later cache-busting).
