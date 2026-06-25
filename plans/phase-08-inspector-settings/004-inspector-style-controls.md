---
task: 004
phase: 08
title: Inspector Tab — Foundational Style Controls
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001, 002]
retry_count: 0
---

# Task 004 — Inspector Tab — Foundational Style Controls

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001, 002
> **Retry count:** 0

## Description

Build the foundational style controls in the Inspector tab — **Layout** (display/flex
basics), **Spacing** (padding/margin), **Size** (width/height/max), and **Typography**
(font family/size/weight/line-height/color) — writing to the node's style props.

## Context

These are the editor's first real styling controls. Style props use the Phase 04 responsive
shape `{ base, <bp>: v }`; this phase edits the **base** value (per-breakpoint editing is
Phase 09). Controls are declared via the schema system (task 001) and grouped into sections
matching the reference inspector.

## Requirements (Test Description)

- **Test:** Given the Inspector tab for a selected element, Layout/Spacing/Size/Typography
  sections render with their controls.
- **Test:** Given a style edit (e.g. padding), the node's style prop (base) updates.
- **Test:** Given the value/unit model, controls handle px/%/rem etc. consistently.
- **Test:** Given Typography on Heading/Text, font controls apply; given Layout on
  Section/Container, layout controls apply (relevant controls per element).
- **Test:** Style props validate against the schema (Phase 04).

## Acceptance Criteria

- [ ] Layout, Spacing, Size, Typography control groups in the Inspector tab.
- [ ] Typography controls include font-family picker sourced from WP Font Library + system-font fallback.
- [ ] Controls write style props (base value) via the store, using the value/unit model.
- [ ] Element-appropriate control sets (e.g. Typography for text elements).
- [ ] Sections grouped/collapsible per the reference.
- [ ] Vitest covers style-prop editing; lint/format/typecheck pass.

## Files to Create

- `app/inspector/style/` — style control groups (layout/spacing/size/typography).
- (edit) `app/elements/definitions/*.ts` — declare Inspector style schemas per element.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Write to the `base` slot of the responsive prop shape; Phase 09 adds the per-breakpoint
  layer on top of these same controls.
- Keep the style-prop vocabulary aligned with what Phase 10's CSS engine will consume.
- **Font-family picker:** query `GET /wp/v2/fonts` (WordPress Font Library, WP 7.0) and
  merge with a static system-font fallback list (Arial, Helvetica, Georgia, Times New Roman,
  Verdana, Courier New, `system-ui`, etc.). Show a searchable dropdown with a live preview.
  The same font-resolution logic is reused in Phase 11's token manager UI.
