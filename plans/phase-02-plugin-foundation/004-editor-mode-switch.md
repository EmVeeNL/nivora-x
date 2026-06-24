---
task: 004
phase: 02
title: Per-Page Editor Mode & Gutenberg Coexistence
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [003]
retry_count: 0
---

# Task 004 — Per-Page Editor Mode & Gutenberg Coexistence

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 003
> **Retry count:** 0

## Description

Store a per-post **editor mode** flag (`nivorax` | `default`) and implement the switching
behavior so NivoraX and Gutenberg coexist: a post is edited in one mode at a time, each
side's content is preserved separately, and switching never converts or destroys the other.

## Context

This is the agreed coexistence model: **mode toggle, not sync**. The flag decides which
editor opens and (via task 009) what the front end renders. NivoraX content lives in post
meta (task 005); Gutenberg blocks stay in `post_content`. Switching flips the flag and
leaves both stores intact.

## Requirements (Test Description)

- **Test:** Given a post, the mode flag defaults sensibly and persists in post meta.
- **Test:** Given "Edit with NivoraX", opening the editor sets/keeps mode = `nivorax`.
- **Test:** Given a NivoraX-mode post, switching back to the block editor sets mode =
  `default` while leaving `_nivorax_data` untouched.
- **Test:** Given a switch in either direction, the other editor's stored content is
  unchanged (no conversion, no loss).
- **Test:** Switching is capability-gated and nonce-protected.

## Acceptance Criteria

- [ ] Mode flag stored in post meta (e.g. `_nivorax_edit_mode`) with a sane default.
- [ ] Entering the NivoraX editor sets `nivorax`; "Back to WordPress editor" sets `default`.
- [ ] Both content stores (`post_content`, `_nivorax_data`) are preserved across switches.
- [ ] Switch actions are capability-gated + nonce-protected.
- [ ] Passes PHPCS + PHPStan; covered by tests for each transition.

## Files to Create

- `src/Editor/EditorMode.php` — read/write the mode flag + switch handlers.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the meta key constant shared with task 009 (front-end switch) and task 005 (storage).
- A small admin notice/link in the block editor offering "Edit with NivoraX" (and vice
  versa) makes the coexistence visible; keep it minimal here.
