---
phase: 11
slug: design-tokens
title: Design Tokens
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 11 — Design Tokens

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Build the global **design-token system** — the source of consistent styling across the
editor and front end. A site-wide token model + storage, a token manager UI (Colors,
Typography, Spacing, Effects), token references wired into the Phase 08 foundational style
controls, and token resolution in **both** CSS engines (JS + PHP) via **CSS custom
properties** — filling the Phase 10 token seam. Editing a token cascades everywhere it's
referenced. (Expanding the inspector to the full control set is the separate Phase 12.)

## Scope

- **Token model + site-wide storage** (mirroring the Phase 02 settings / Phase 09 breakpoint
  accessor pattern): groups for **Colors**, **Typography** (families + type scale),
  **Spacing** scale, and **Effects** (radii, shadows, borders). Each token: id, group, name,
  value. Seeded with sensible defaults.
- **Font family source:** available font families for Typography tokens are drawn from two
  sources in priority order: (1) the **WordPress Font Library** (WP 7.0) — fonts the site
  owner has installed (including Google Fonts downloaded via the library) via
  `GET /wp/v2/fonts`; (2) a curated list of **common local/system fonts** as a fallback
  (e.g. Arial, Helvetica, Georgia, Times New Roman, Verdana, Courier New, `system-ui`).
- **Token manager UI** (reference screenshot 03): create/edit/delete tokens grouped by
  category.
- **Token references on node style props** — stored by stable **id** (never the resolved
  value) so global edits cascade.
- **Token-aware Phase 08 controls:** color/spacing/typography/effect controls accept a token
  reference **or** a raw value.
- **Tokens → CSS custom properties:** emit a variables block (`--nx-…`); generated rules
  reference `var(--nx-…)`. Both the JS (editor) and PHP (front-end) CSS engines emit + consume
  them — filling the Phase 10 token seam.
- **Live propagation:** editing a token updates the variable, cascading to all referencing
  nodes in the editor and (on save/token change) the front end.
- **Reference integrity:** rename/delete handled safely (id-based refs; guard/warn).
- Extend the Phase 10 **parity fixtures** to cover token variables; Pest + Vitest coverage.

## Out of Scope

- The **full styling-controls expansion** (borders/background/shadow/transform UIs) — Phase 12.
- **Theme builder / templates** — Phase 13.
- Token set **import/export** and theme marketplace — later.
- **Local/scoped** token overrides — global tokens only this phase.

## Success Criteria

- [x] Token model + site-wide storage for Colors, Typography, Spacing, Effects; seeded defaults.
- [x] Token manager UI: create/edit/delete grouped tokens; persists and reloads.
- [x] Phase 08 controls can reference tokens or raw values; references stored by id.
- [x] Tokens emit CSS custom properties consumed by both JS + PHP CSS engines.
- [x] Editing a token cascades to referencing nodes live (editor) and on the front end.
- [x] Renaming/deleting a token handles references safely (guard/warn).
- [x] The parity harness covers token variables (JS == PHP).
- [x] Pest + Vitest cover CRUD/resolution/propagation; all gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Token model + site-wide storage + seeded defaults (PHP accessor + client) | — | Done |
| 002  | Token manager UI (Colors/Typography/Spacing/Effects; CRUD) | 001 | Done |
| 003  | Token references in Phase 08 style controls (token-or-value) | 001 | Done |
| 004  | Tokens → CSS custom properties in the JS generator (editor) | 001 | Done |
| 005  | Tokens → CSS custom properties in the PHP generator + regen on token change | 001 | Done |
| 006  | Reference integrity (rename/delete guards) + live propagation | 002, 003 | Done |
| 007  | Parity fixtures for token variables + tests + polish | 004, 005 | Done |

## Architectural Notes

- **Font family source:** query `GET /wp/v2/fonts` (WordPress Font Library, WP 7.0) for
  installed font families (includes Google Fonts the site owner has downloaded). Merge with a
  static fallback list of common system/local fonts (Arial, Helvetica, Georgia, Times New
  Roman, Verdana, Courier New, `system-ui`, `sans-serif`, `serif`, `monospace`). Present the
  combined, de-duplicated list in any font-family picker. No custom downloading logic needed —
  WP Font Library handles font registration and `@font-face` generation.
- **CSS custom properties make propagation cheap:** the token set emits a variables block
  (`:root` on the front end; the iframe root in the editor); style rules reference
  `var(--nx-…)`. This is the implementation of the Phase 10 token seam in both generators.
- **Reference by stable id, never inline the value** — so a global token edit cascades to all
  referencing nodes without rewriting their CSS.
- Site-wide storage mirrors the **Phase 02 settings / Phase 09 breakpoint** accessor pattern —
  one source consumed by the manager UI, the controls, and both CSS engines.
- **Reference integrity:** deleting/renaming must not orphan references — warn on delete and
  offer reassignment; references are id-based.
- Extend the **Phase 10 golden fixtures** to cover token variable emission so JS + PHP stay in
  parity.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Renaming/deleting tokens orphans references | M | M | Id-based references + guard/warn + reassignment. |
| Editor vs front-end token propagation diverges | M | M | CSS custom properties + shared parity fixtures (Phase 10 harness). |
| Variable scope/specificity conflicts | L | M | Scope variables at a NivoraX root; document the strategy. |
| JS/PHP variable-emission drift | M | M | Extend the Phase 10 parity harness to token variables. |
