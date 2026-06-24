---
task: 003
phase: 02
title: Post-Type Integration & "Edit with NivoraX"
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 002]
retry_count: 0
---

# Task 003 — Post-Type Integration & "Edit with NivoraX"

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 002
> **Retry count:** 0

## Description

On the post types enabled in Settings, expose an "Edit with NivoraX" affordance — a button
on the native edit screen and a row action in the list table — and centralize the
capability checks that gate NivoraX editing.

## Context

This is the Elementor-style "augment existing post types" integration. It must appear only
on enabled post types (reading the task-002 accessor) and only for users with the right
capability. The affordances link to the editor screen (task 008 provides the screen;
task 007 provides the new-page entry). Capability gating defined here is reused by
006/007/008.

## Requirements (Test Description)

- **Test:** Given an enabled post type, the edit screen shows an "Edit with NivoraX"
  button and the list table shows an "Edit with NivoraX" row action.
- **Test:** Given a disabled post type, neither affordance appears.
- **Test:** Given a user without the NivoraX edit capability, the affordances are hidden
  and the editor route is denied.
- **Test:** Given the affordance, its URL targets the NivoraX editor screen for that post.

## Acceptance Criteria

- [ ] "Edit with NivoraX" button on the native edit screen for enabled post types.
- [ ] "Edit with NivoraX" row action in the list table for enabled post types.
- [ ] Affordances respect both the enabled-types setting and capability checks.
- [ ] A central capability helper gates NivoraX editing (reused by other tasks).
- [ ] Passes PHPCS + PHPStan; covered by tests.

## Files to Create

- `src/Integration/PostTypeIntegration.php` — registers affordances per enabled type.
- `src/Capabilities/Capabilities.php` — central capability checks/helpers.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Register any custom capability in `phpcs.xml` (project convention) so WPCS stays quiet.
- The affordance URL should carry the post ID + a nonce; the editor screen (008) validates.
- Don't hard-code post types — iterate the enabled set from the task-002 accessor.
