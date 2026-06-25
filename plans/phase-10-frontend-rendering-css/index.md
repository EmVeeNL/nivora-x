---
phase: 10
slug: frontend-rendering-css
title: Front-End Rendering & CSS Engine
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 10 — Front-End Rendering & CSS Engine

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Render NivoraX pages for real visitors and guarantee **editor ↔ front-end parity**. Build
the **PHP rendering engine** (per-element renderers implementing `ElementRendererInterface`,
mirroring the React renderers) and the **CSS-generation engine** (style props + desktop-first
responsive overrides + token references → scoped, media-query CSS), generated on save and
cached. Replace the Phase 02 placeholder front-end switch with the real renderer, and
**unify the editor canvas onto generated CSS** (swapping the Phase 08 inline seam). Parity
across all four producers (React render, PHP render, JS CSS, PHP CSS) is enforced by shared
**golden fixtures in CI**.

## Scope

- **PHP renderer:** `ElementRendererInterface` + a renderer registry (type → renderer)
  mirroring the JS registry; recursive tree → escaped HTML; safe fallback for unknown types;
  per-node scoped class hook (`.nivorax-<id>`).
- **PHP element renderers** for the starter set (Section, Container, Heading, Text) matching
  the React markup contract.
- **CSS generation rules + JS generator (editor, live):** resolve style props (desktop-first
  responsive) + token references → scoped CSS with **max-width media queries**; deterministic,
  deduplicated.
- **PHP CSS generator** implementing the same rules for the front end.
- **Generate-on-save pipeline:** hook Phase 04 save/publish → generate + store CSS (file in
  uploads, fallback meta) → enqueue on the front end; regenerate on save and on
  token/breakpoint changes; versioned invalidation.
- **Replace the Phase 02 front-end switch** with the real PHP renderer + enqueued CSS for
  `nivorax`-mode posts (default-mode untouched).
- **Unify the editor canvas** onto the JS-generated CSS injected into the Phase 05 iframe
  (replacing the Phase 08 inline applier).
- **Golden-fixture parity harness:** shared fixtures (tree → expected HTML + CSS) tested on
  React (Vitest) **and** PHP (Pest) in CI; drift fails the build.

## Out of Scope

- The **design-tokens manager UI** (Phase 11) — the engines resolve token *references* via a
  seam, but resolve concrete values for now; the token system arrives in Phase 11.
- **Theme/template** front-end integration (headers/footers/templates) — Phase 13.
- **Dynamic content** binding — Phase 14.
- Deeper **performance** work (critical CSS, minification tuning, lazy) — Phase 18 (this phase
  does generate-on-save caching only).

## Success Criteria

- [ ] The PHP renderer renders a tree to escaped HTML via per-element renderers; unknown types
      fail safe; each node emits its scoped class hook.
- [ ] Starter elements' PHP HTML matches the React HTML for shared fixtures.
- [ ] The CSS engines (JS + PHP) produce deterministic, scoped, deduplicated CSS with correct
      desktop-first max-width media queries — and agree with each other on fixtures.
- [ ] CSS is generated on save, cached, and enqueued on the front end; regenerated on save and
      token/breakpoint changes; invalidation works.
- [ ] The Phase 02 front-end switch renders `nivorax`-mode posts with the real renderer + CSS;
      default-mode posts are untouched.
- [ ] The editor canvas uses generated CSS (Phase 08 inline seam removed); editor and front
      end render identically for fixtures.
- [ ] The golden-fixture parity harness runs React + PHP in CI and fails on drift.
- [ ] Pest + Vitest + an E2E front-end render check pass; PHPCS/PHPStan/lint green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | `ElementRendererInterface` + PHP renderer registry + recursive tree→HTML (escaping, fallback, scoped hooks) | — | Done |
| 002  | PHP element renderers for the starter set (Section, Container, Heading, Text) | 001 | Done |
| 003  | CSS generation rules + JS generator (editor live): scoped classes, desktop-first media queries, token seam | — | Done |
| 004  | PHP CSS generator (same rules) + generate-on-save pipeline (store, enqueue, invalidate) | 003 | Done |
| 005  | Replace Phase 02 front-end switch with the real PHP renderer + enqueued CSS | 002, 004 | Done |
| 006  | Unify editor canvas onto JS-generated CSS (remove Phase 08 inline seam; inject into iframe) | 003 | Done |
| 007  | Golden-fixture parity harness (HTML: React vs PHP; CSS: JS vs PHP) in CI | 002, 003, 004 | Done |
| 008  | Tests + E2E front-end render + polish | 005, 006, 007 | Done |

## Architectural Notes

- **Four producers, one contract.** React render + PHP render + JS CSS + PHP CSS must agree.
  Capture the markup + CSS as **golden fixtures**; both languages test against them in CI;
  drift is a build failure. This is the project's central parity discipline finally enforced.
- The CSS engines must implement the **same desktop-first cascade** defined in Phase 09 —
  reuse its cascade fixtures; media queries are **max-width**.
- **Scoping** is per-node class `.nivorax-<id>` (Phase 04 IDs are CSS-safe by design);
  deterministic ordering + dedupe keep output stable and cacheable.
- **Generate-on-save** hooks the Phase 04 persistence; store CSS as a file in uploads
  (preferred for cacheability; meta fallback); enqueue only for `nivorax`-mode posts; version/
  invalidate on token/breakpoint changes.
- **Editor parity:** the editor uses the JS generator for *live* CSS (the PHP cache only
  updates on save), injected into the Phase 05 iframe, replacing the Phase 08 applier. The two
  generators are kept honest by fixtures — minimize divergence by keeping generation rules
  data-driven.
- **Token resolution** is a seam now (resolve concrete values); the token manager is Phase 11.
- Escape at every PHP output boundary (WP standard / PHPCS).

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| React/PHP markup drift (the central risk) | H | H | Golden fixtures on both sides in CI; drift fails the build. |
| JS (editor) vs PHP (front-end) CSS divergence | H | M | Data-driven generation rules + shared CSS fixtures tested both sides. |
| Cache invalidation bugs (stale front-end CSS) | M | M | Version keys tied to document + tokens + breakpoints; regenerate on relevant saves; tests. |
| CSS specificity conflicts with the active theme | M | M | Tight per-node scoping + documented reset; test against a default theme. |
| Maintaining generation logic in two languages | M | H | Keep rules declarative + fixture-driven; revisit consolidation if drift recurs. |
