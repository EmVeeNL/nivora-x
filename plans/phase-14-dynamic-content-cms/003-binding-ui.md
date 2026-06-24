---
task: 003
phase: 14
title: Binding UI (Make Dynamic)
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 002]
retry_count: 0
---

# Task 003 — Binding UI (Make Dynamic)

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 002
> **Retry count:** 0

## Description

Add a "make dynamic" affordance to bindable inspector controls: choose a source + field (from
the provider catalog) + fallback + format, storing a binding descriptor on the prop.

## Context

This is the user-facing mapping panel (reference screenshot 07). It reads the field catalog
from providers (task 002) over REST and writes binding descriptors (task 001). Controls toggle
between static value and dynamic binding.

## Requirements (Test Description)

- **Test:** Given a bindable control, a "make dynamic" toggle reveals source + field pickers.
- **Test:** Given a source, the field picker lists that provider's fields (from REST).
- **Test:** Given a chosen field, a binding descriptor is stored on the prop (with optional
  fallback/format).
- **Test:** Given a bound control, it indicates the binding (source/field) vs a static value.
- **Test:** Toggling back to static restores manual editing.

## Acceptance Criteria

- [ ] Make-dynamic toggle on bindable controls.
- [ ] Source + field pickers driven by the provider catalog (REST).
- [ ] Fallback + format options; descriptor stored on the prop.
- [ ] Clear bound-vs-static indication.
- [ ] Vitest covers the binding UI; lint/format/typecheck pass.

## Files to Create

- `app/dynamic/BindingControl.tsx` — make-dynamic wrapper + source/field pickers.
- `src/Rest/FieldsController.php` — REST endpoint exposing the provider field catalog.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 08 control framework; a binding is a value-kind alongside raw + token values.
- Field catalog can be context-aware (e.g. fields for the current template's target type).
