---
task: 004
phase: 14
title: Front-End Binding Resolution
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 004 — Front-End Binding Resolution

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Resolve bindings during PHP front-end rendering: for each bound prop, resolve its value via the
provider against the current context (request post/term/author, or the current loop item),
applying fallback + format, before the element renders.

## Context

This is what makes dynamic content appear for visitors. It plugs into the Phase 10 PHP renderer
and the Phase 13 template/loop context. Context correctness (which post is "current") is the
crux, especially inside loops and embedded parts.

## Requirements (Test Description)

- **Test:** Given a bound prop on a single template, it resolves the current post's field.
- **Test:** Given a bound prop inside a query loop, it resolves the loop item's field.
- **Test:** Given a missing value, the fallback applies; given a format, it's applied.
- **Test:** Given nested loops/parts, the innermost context is used correctly.
- **Test:** Resolution + output escaping pass PHPCS + PHPStan.

## Acceptance Criteria

- [ ] Bindings resolved in the PHP renderer against the current/loop context.
- [ ] Fallback + format applied; output escaped.
- [ ] Correct context in nested loops/parts.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Dynamic/BindingResolver.php` — resolve bindings against a context.
- (edit) `src/Render/TreeRenderer.php` — resolve bound props before element render.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Define a context stack (template → loop item → part) so the innermost context wins.
- Escape resolved values appropriately for their target (text vs attribute vs URL).
