---
task: 001
phase: 10
title: PHP Renderer Interface & Registry
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — PHP Renderer Interface & Registry

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Define `ElementRendererInterface` and a PHP renderer registry (type → renderer), plus the
recursive tree → HTML walker that emits escaped markup, a safe fallback for unknown types,
and the per-node scoped class hook (`.nivorax-<id>`).

## Context

This mirrors the JS element registry/renderer (Phase 05) on the server. It's the foundation
for per-element PHP renderers (task 002) and the front-end switch (task 005). The markup it
produces must match the React output — captured as golden fixtures (task 007).

## Requirements (Test Description)

- **Test:** Given a registered renderer, the registry resolves it by `type`.
- **Test:** Given an unknown type, the walker emits a safe placeholder (no fatal).
- **Test:** Given a tree, the walker renders nested HTML with correct escaping at every
  output boundary.
- **Test:** Given any node, its rendered root carries the `.nivorax-<id>` scoping class.
- **Test:** Interface + registry pass PHPCS + PHPStan.

## Acceptance Criteria

- [ ] `ElementRendererInterface` (docblocked per project conventions).
- [ ] Renderer registry: register / resolve / fallback.
- [ ] Recursive tree→HTML walker with escaping + scoped class hooks.
- [ ] Safe handling of unknown types.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Render/ElementRendererInterface.php` — renderer contract.
- `src/Render/RendererRegistry.php` — registry + fallback.
- `src/Render/TreeRenderer.php` — recursive tree→HTML walker.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Mirror the JS registry shape (Phase 05) so per-element parity is 1:1.
- The scoped class is the hook the CSS engine (tasks 003/004) targets — keep the id→class
  convention shared with the JS side.
