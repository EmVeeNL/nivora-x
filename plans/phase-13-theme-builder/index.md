---
phase: 13
slug: theme-builder
title: Theme Builder
created: 2026-06-24
status: In Progress # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 13 — Theme Builder

> **Created:** 2026-06-24
> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Turn NivoraX into a theme builder. **Templates** (Header, Footer, Single, Archive/Index/Home,
404, Search) are edited like documents in the NivoraX editor, assigned via **conditional rules
with precedence**, can embed **reusable parts**, and **override the WordPress template
hierarchy** to render on the live site (reusing the Phase 10 renderer + CSS). Full dynamic
field binding + custom queries are Phase 14; this phase provides the structural content slot
(singles) and a basic loop (archives).

## Scope

- **Template entity:** a document (Phase 04 model) stored in a dedicated CPT
  (`nivorax_template`) with **type** + **conditions** metadata — distinct from page content
  (which augments native posts), mirroring Elementor's library.
- **Template types:** Header, Footer, Single (post/page/CPT), Archive/Index/Home, 404, Search.
- **Editing templates** in the NivoraX editor (reuse the editor batch) via a template-context
  mode + an "All Templates" management screen.
- **Reusable parts:** an embed-by-reference part element (edits propagate); cycle detection.
- **Conditional assignment** rules with precedence: include/exclude by entire-site / post type
  / specific content / taxonomy / archive type; most-specific match wins.
- **Structural slots:** a content slot (singles) + a basic post loop (archives) — full dynamic
  binding is Phase 14.
- **Front-end integration:** hook the WP template hierarchy to render NivoraX templates,
  composing header + content + footer via the Phase 10 renderer + cached CSS.

## Out of Scope

- **Dynamic content field binding + custom query loops** — Phase 14 (this phase ships the
  structural content slot + a basic loop only).
- **Component & pattern library** — Phase 15.

## Success Criteria

- [ ] `nivorax_template` CPT with type + conditions; templates edited in the NivoraX editor.
- [ ] All listed template types supported.
- [ ] Conditional assignment with precedence resolves the correct template per request.
- [ ] Reusable parts embed by reference (propagate); cycles prevented.
- [ ] The WP template hierarchy override renders NivoraX templates on the front end
      (header/footer/single/archive/404/search), composing parts + content via Phase 10.
- [ ] Single templates render the current post's content slot; archives render a basic loop.
- [ ] Tests cover assignment resolution, part embedding, and hierarchy override; gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | `nivorax_template` CPT + type + conditions metadata + template document model | — | In Review |
| 002  | Edit templates in the NivoraX editor (template-context mode) + All Templates screen | 001 | In Review |
| 003  | Reusable template parts (embed-by-reference element + cycle detection + propagation) | 001 | In Review |
| 004  | Conditional assignment rules + precedence resolver | 001 | In Review |
| 005  | Structural elements: content slot (singles) + basic post loop (archives) | 001 | In Review |
| 006  | Front-end template-hierarchy override + composition (header/content/footer) rendering | 002, 004, 005 | In Review |
| 007  | Tests + E2E (publish header/footer/single → view on front end) + polish | 003, 006 | In Review |

## Architectural Notes

- **Templates reuse the document model + the whole editor.** A template is a document with
  type + conditions metadata in a dedicated CPT (`nivorax_template`) — separate from page
  content (which augments native posts). Mirrors Elementor's `elementor_library`.
- **Parts embed by reference** (a "part" element stores the referenced template id); render
  resolves + inlines; **detect cycles** at edit + render time.
- **Conditional resolution:** rules → specificity ranking → most-specific match wins
  (specific content > taxonomy > post type > site-wide). Deterministic + tested; cache the
  resolved assignment and invalidate on template/conditions change.
- **Front-end:** hook `template_include` to render NivoraX templates; compose header + content
  template + footer; the content slot renders the current post (its NivoraX content via Phase
  10, or `post_content`). Reuse the Phase 10 renderer + cached CSS.
- Reuse the Phase 02 enabled-post-types + capability patterns for template management.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Template-hierarchy override conflicts with themes/plugins | H | M | Hook at the right priority; per-request opt-out; test against default + a popular theme. |
| Conditional resolution ambiguity | M | M | Strict specificity rules + conflict tests. |
| Recursive part embedding | M | L | Cycle detection at edit + render. |
| Per-request template resolution cost | M | M | Cache resolved assignments; invalidate on template/conditions change. |
