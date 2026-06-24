---
task: 005
phase: 14
title: Editor Binding Preview
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003]
retry_count: 0
---

# Task 005 — Editor Binding Preview

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003
> **Retry count:** 0

## Description

Preview bound values in the editor canvas by resolving bindings via REST against the current or
a sample post, so designers see real-ish content while editing instead of placeholders.

## Context

The editor can't run PHP data access directly, so binding preview goes through a REST endpoint
backed by the same providers (task 002). For templates (no single "current" post), a chosen
sample/preview post supplies the context.

## Requirements (Test Description)

- **Test:** Given a bound prop, the canvas shows the resolved value from the preview context.
- **Test:** Given a template, a selectable sample/preview post drives the context.
- **Test:** Given a missing value, the fallback (or a clearly-marked placeholder) shows.
- **Test:** Given a binding change, the preview updates (debounced REST fetch).
- **Test:** Preview uses the same provider logic as the front end (consistency).

## Acceptance Criteria

- [ ] Canvas previews resolved binding values via REST.
- [ ] Sample/preview post selection for templates.
- [ ] Fallback/placeholder handling.
- [ ] Consistent with front-end provider resolution.
- [ ] Vitest (client) + Pest (REST) cover preview; gates green.

## Files to Create

- `app/dynamic/useBindingPreview.ts` — resolve bindings via REST for the canvas.
- `src/Rest/BindingPreviewController.php` — preview resolution endpoint.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Back the preview endpoint with the same providers + resolver as the front end (task 004) so
  preview matches production.
- Cache/debounce preview fetches; mark clearly when showing sample data.
