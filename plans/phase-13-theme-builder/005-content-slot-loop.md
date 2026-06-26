---
task: 005
phase: 13
title: Content Slot & Basic Post Loop
status: In Review # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 005 — Content Slot & Basic Post Loop

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Add the structural elements templates need: a **content slot** (renders the current post's
content in single templates) and a **basic post loop** (iterates posts in archive templates).
Full dynamic field binding is Phase 14; these are the structural placeholders.

## Context

A single template wraps a content slot where the post's body renders; an archive template
repeats a loop item over the query's posts. This task delivers those structural elements; the
rich dynamic data binding (mapping fields to elements, customizing the query) is Phase 14.

## Requirements (Test Description)

- **Test:** Given a single template with a content slot, the slot renders the current post's
  content (its NivoraX content via Phase 10, or `post_content`).
- **Test:** Given an archive template with a loop, it repeats its loop-item subtree over the
  query's posts.
- **Test:** Given the editor, the content slot + loop show representative placeholder content.
- **Test:** Content slot + loop render correctly on both editor and front end (parity-aware).

## Acceptance Criteria

- [ ] Content slot element (single templates) rendering the current post's content.
- [ ] Basic post loop element (archive templates) repeating a loop item over the query.
- [ ] Editor placeholders for both; front-end rendering via Phase 10.
- [ ] Vitest + Pest cover both; gates green.

## Files to Create

- `app/elements/definitions/content-slot.ts` + `src/Render/Elements/ContentSlotRenderer.php`
- `app/elements/definitions/post-loop.ts` + `src/Render/Elements/PostLoopRenderer.php`

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the loop query basic (the main query / archive context) here; custom query controls are
  Phase 14.
- The content slot is where single templates render the post body — coordinate with the
  front-end composition (task 006).
