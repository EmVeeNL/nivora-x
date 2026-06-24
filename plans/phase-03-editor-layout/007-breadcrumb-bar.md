---
task: 007
phase: 03
title: Bottom Breadcrumb Bar (Static)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 007 — Bottom Breadcrumb Bar (Static)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Build the bottom breadcrumb bar with a static placeholder path (e.g. Body › Page Wrapper ›
Hero Section › … › Heading) and any small status indicators shown in the reference.

## Context

Completes the shell's regions. The breadcrumb reflects the selected element's ancestry once
selection exists (editor batch); here it's a static placeholder so the layout matches the
reference and the region is reserved.

## Requirements (Test Description)

- **Test:** Given the breadcrumb bar, it renders a static ancestry path styled like the
  reference.
- **Test:** Given the bar, placeholder indicators (if any) render in the correct positions.
- **Test:** The bar occupies its reserved region without overlapping the panels/canvas.

## Acceptance Criteria

- [ ] Bottom breadcrumb bar with a static placeholder path matching the reference.
- [ ] Any reference indicators present as placeholders.
- [ ] Correctly positioned in the layout region from task 002.
- [ ] Vitest smoke test; lint/format/typecheck pass.

## Files to Create

- `app/shell/BreadcrumbBar.tsx` — static breadcrumb + indicators.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Structure the breadcrumb to accept a path array so the editor batch can feed real
  selection ancestry without a rewrite.
