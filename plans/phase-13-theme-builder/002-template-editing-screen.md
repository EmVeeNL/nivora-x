---
task: 002
phase: 13
title: Template Editing & All-Templates Screen
status: In Review # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Template Editing & All-Templates Screen

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Let users create and edit templates in the NivoraX editor via a template-context mode, and
manage them through an "All Templates" admin screen (list, create by type, edit, delete).

## Context

Templates reuse the entire editor batch — the only difference is the editing *context* (a
header vs a page) and which structural elements/slots are relevant. The management screen is
the theme-builder entry point (reference screenshot 10's left rail of template types).

## Requirements (Test Description)

- **Test:** Given "Create template", the user picks a type and is routed into the NivoraX
  editor for that template.
- **Test:** Given the editor in template mode, it loads/saves the template document via the
  Phase 04 persistence.
- **Test:** Given the All Templates screen, templates list grouped/filterable by type with
  create/edit/delete.
- **Test:** Given a template, its type context affects available slots (e.g. content slot for
  singles) — wired with task 005.

## Acceptance Criteria

- [ ] Template-context editing reusing the NivoraX editor (load/save via Phase 04).
- [ ] All Templates screen: list by type + create/edit/delete.
- [ ] Create flow chooses a type and opens the editor.
- [ ] Capability-gated; PHP + JS gates pass.

## Files to Create

- `src/Admin/Screen/TemplatesScreen.php` — All Templates management screen.
- `app/templates/TemplateEditorContext.ts` — template-mode context for the editor.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 02 editor screen/route; pass a template context (type) into the app bootstrap.
- The All Templates screen can live under the NivoraX menu alongside All Pages / Settings.
