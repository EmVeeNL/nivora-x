---
task: 008
phase: 01
title: Vite ↔ WordPress Integration
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [004, 007]
retry_count: 0
---

# Task 008 — Vite ↔ WordPress Integration

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 004, 007
> **Retry count:** 0

## Description

Connect the Vite build to WordPress: enqueue hashed production assets from Vite's
`manifest.json`, and in development serve from the Vite dev server with working HMR
inside WordPress. The plugin auto-detects which mode it's in.

## Context

This is the known-fiddly bridge between the two toolchains and is isolated here on
purpose (see phase risks). Production builds emit hashed files + a `manifest.json`; the
plugin must read that manifest to enqueue the correct files with dependencies. In dev,
the plugin must instead load `@vite/client` and the entry from the running Vite dev
server so React Fast Refresh works while editing inside WP. A registered admin page
provides a mount point to prove the bundle loads.

## Requirements (Test Description)

- **Test:** Given `pnpm build`, Vite emits hashed assets and a `manifest.json` in the
  plugin's build output dir.
- **Test:** Given production mode, loading the plugin's admin page enqueues the hashed
  JS/CSS resolved from the manifest (correct URLs, no 404s).
- **Test:** Given dev mode (dev server running + dev flag on), the admin page loads
  `@vite/client` and the entry from the dev server, and editing `app/main.tsx` hot-
  updates without a full reload.
- **Test:** Given a missing manifest in production, the plugin degrades gracefully with
  an admin notice rather than fataling.

## Acceptance Criteria

- [ ] `vite.config.ts` updated: `build.manifest = true`, output to the plugin build dir,
      dev server `origin`/CORS set for WP, React Fast Refresh enabled.
- [ ] `src/Assets/AssetManager.php` reads the manifest and enqueues entry + CSS +
      dependencies in production.
- [ ] Dev-mode detection (env constant / dev flag) switches to dev-server enqueue with
      `@vite/client`.
- [ ] A registered admin page renders a mount node and loads the bundle.
- [ ] Graceful fallback (admin notice) when the manifest is absent.

## Files to Create

- `src/Assets/AssetManager.php` — manifest-based + dev-server enqueue logic.
- `src/Admin/EditorPage.php` — admin page registration + mount node (minimal).
- (edit) `vite.config.ts` — manifest, output dir, dev server/HMR config.
- (edit) `app/main.tsx` — mount into the admin page node (to prove HMR).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Dev-server URL/port must be reachable from the browser, not just the container — keep
  it host-mapped and configurable via `.env` / a constant.
- Set `type="module"` on Vite-served scripts (use `script_loader_tag`/the modern
  `wp_enqueue_script_module` if available in WP 7.0) — verify which the target WP supports.
- Decide the build output location (e.g. `build/`) once and reference it from both Vite
  and the AssetManager; keep it gitignored but present in CI artifacts.
- This is the highest-risk task in the phase — budget time and lean on a proven WP+Vite
  manifest pattern rather than inventing one.
