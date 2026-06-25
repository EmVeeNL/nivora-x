---
task: 002
phase: 10
title: PHP Element Renderers (Starter Set)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — PHP Element Renderers (Starter Set)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Implement the PHP renderers for the starter elements (Section, Container, Heading, Text), each
producing markup identical to its React counterpart.

## Context

These fill the PHP-render slot reserved on the element definitions (Phase 05) and are verified
against the React renderers via golden fixtures (task 007). The HTML structure, attributes,
and scoped class must match exactly so the front end equals the editor.

## Requirements (Test Description)

- **Test:** Given each starter element node, its PHP renderer emits the expected escaped HTML.
- **Test:** Given Section/Container, children render recursively in order.
- **Test:** Given Heading/Text, the text prop renders (escaped) with the correct tag/level.
- **Test:** Given the same fixture, PHP output matches the React output (parity — wired in 007).
- **Test:** Renderers pass PHPCS + PHPStan with required docblocks.

## Acceptance Criteria

- [ ] PHP renderers for Section, Container, Heading, Text implementing the interface.
- [ ] Markup matches the React renderers (structure, attributes, scoped class).
- [ ] Recursive child rendering for containers.
- [ ] Escaped output throughout.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Render/Elements/SectionRenderer.php`
- `src/Render/Elements/ContainerRenderer.php`
- `src/Render/Elements/HeadingRenderer.php`
- `src/Render/Elements/TextRenderer.php`

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the React render (Phase 05 task 002) open side-by-side; the markup contract is shared.
- Heading level (h1–h6) and Text content mirror the Phase 08 Block schemas.
