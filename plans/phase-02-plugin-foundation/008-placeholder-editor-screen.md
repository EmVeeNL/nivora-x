---
task: 008
phase: 02
title: Placeholder Full-Screen Editor Screen
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 008 — Placeholder Full-Screen Editor Screen

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the full-screen admin editor screen that "Edit with NivoraX" / "New Page" route to.
In Phase 02 it's a **placeholder**: it loads the post, mounts the Phase 01 Vite/React app
container, and passes the post context to the front end — no real editor UI yet.

## Context

This is the host screen the real editor (Phase 03+) renders into. It validates the request
(post ID, capability, nonce), enqueues the editor bundle via the Phase 01 AssetManager,
and renders a mount node with bootstrap data (post ID, mode, REST nonce, etc.). The actual
three-panel UI is Phase 03; canvas/data come later.

## Requirements (Test Description)

- **Test:** Given a valid "Edit with NivoraX" request, the screen renders a full-screen
  container with the React mount node and enqueues the editor bundle.
- **Test:** Given the screen, bootstrap data (post ID, edit mode, REST root + nonce) is
  exposed to the app (e.g. via `wp_localize_script` / inline data).
- **Test:** Given an invalid post ID, missing capability, or bad nonce, access is denied.
- **Test:** The screen renders without admin chrome interfering (full-screen takeover).

## Acceptance Criteria

- [ ] Full-screen editor screen route that validates post ID + capability + nonce.
- [ ] Mounts the Phase 01 React container and enqueues the editor bundle (dev + prod modes).
- [ ] Passes bootstrap context (post ID, mode, REST nonce) to the app.
- [ ] Renders as a full-screen takeover (no clashing admin UI).
- [ ] Passes PHPCS + PHPStan; covered by tests.

## Files to Create

- `src/Admin/Screen/EditorScreen.php` — request validation + full-screen render + mount.
- `src/Editor/Bootstrap.php` — assembles the bootstrap data passed to the app.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 01 `AssetManager` (manifest/dev-server enqueue) — don't re-implement.
- Keep the React side a bare mount in this phase; Phase 03 builds the shell into it.
- This screen is the convergence point for tasks 003 and 007 — keep its route/URL stable.
