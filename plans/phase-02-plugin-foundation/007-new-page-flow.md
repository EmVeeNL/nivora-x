---
task: 007
phase: 02
title: New Page Flow
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 008]
retry_count: 0
---

# Task 007 — New Page Flow

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 008
> **Retry count:** 0

## Description

Implement "New Page": create a native page draft and route the user straight into the
NivoraX editor screen for it, with the editor mode set to `nivorax`.

## Context

This is the fast path from the NivoraX menu to building. It creates a real native post
(so it stays compatible with the augment model), sets the mode flag (task 004), and opens
the placeholder editor screen (task 008). Must be capability-gated and nonce-protected to
avoid drive-by post creation.

## Requirements (Test Description)

- **Test:** Given "New Page", a native page draft is created and the user lands on the
  NivoraX editor screen for that post.
- **Test:** Given creation, the new post's editor mode is set to `nivorax`.
- **Test:** Given a user without the capability, no post is created and the action is denied.
- **Test:** The action is nonce-protected against CSRF.

## Acceptance Criteria

- [ ] "New Page" creates a native draft of the appropriate post type.
- [ ] The user is routed to the editor screen (task 008) for the new post.
- [ ] Editor mode is set to `nivorax` on creation.
- [ ] Capability-gated + nonce-protected.
- [ ] Passes PHPCS + PHPStan; covered by tests.

## Files to Create

- `src/Admin/Screen/NewPageScreen.php` — (extend the task-001 stub) create + redirect.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Decide the default post type for "New Page" (likely `page`); consider a type chooser
  if multiple types are enabled.
- Use a proper redirect to the editor screen URL (with post ID + nonce) the task-003/008
  affordances use, so all entry points converge on one route.
