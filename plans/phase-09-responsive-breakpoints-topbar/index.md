---
phase: 09
slug: responsive-breakpoints-topbar
title: Responsive Breakpoints & Top Bar
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 09 — Responsive Breakpoints & Top Bar

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Complete the editor batch with responsive editing and a functional top bar. Make the
Phase 03 breakpoint switcher real: **site-wide configurable breakpoints** (presets +
custom), **desktop-first** responsive editing where inspector controls write the active
breakpoint's override (with inherited/overridden indicators + reset), and the canvas
reflows to the active breakpoint. Wire the top bar: **Save draft**, **Publish**, **Preview**
(in-editor clean view), and the **non-layout-shifting autosave indicator** fed by the
Phase 04 status signal. After this phase the editor is usable end-to-end.

## Scope

- **Site-wide breakpoint configuration:** default presets (Desktop/Tablet/Mobile) +
  add/edit/remove custom breakpoints; persisted globally (option/settings), exposed via a
  typed accessor. The set drives the switcher, canvas widths, and responsive resolution.
- **Functional breakpoint switcher** built from the configured set; the active breakpoint
  (UI state) drives canvas width + style resolution.
- **Desktop-first responsive editing:** Phase 08 style controls now write to the **active
  breakpoint override** (base = desktop); narrower breakpoints override downward. The
  active-breakpoint **resolver** honors the cascade across configured breakpoints.
- **Inherited-vs-overridden** indicator per control + **reset to inherited**.
- **Top bar actions:** Save draft + Publish (call Phase 04 persistence), **Preview**
  (chrome-off clean canvas at the active breakpoint), and the **autosave indicator**
  (idle/saving/saved/error from the Phase 04 signal) rendered without layout shift in the
  Phase 03 reserved slot.
- Vitest + an E2E responsive-edit happy path.

## Out of Scope

- The full **multi-device simultaneous preview** screen (screenshot 08) — later.
- **Front-end preview link / PHP rendering / CSS media-query generation** — Phase 10.
- Full styling controls — Phase 12; design tokens — Phase 11.

## Success Criteria

- [ ] Site-wide breakpoints: presets + add/edit/remove custom; persisted globally; the
      switcher reflects the configured set.
- [ ] Selecting a breakpoint resizes the canvas and sets the active editing breakpoint.
- [ ] Desktop-first: editing a control at a narrower breakpoint creates an override there;
      the desktop base is unchanged.
- [ ] Inherited-vs-overridden is shown per control with reset-to-inherited.
- [ ] The canvas renders resolved values for the active breakpoint (cascade honored).
- [ ] Save draft + Publish work via Phase 04 persistence.
- [ ] Preview toggles a clean, chrome-off canvas view at the active breakpoint.
- [ ] The autosave indicator shows idle/saving/saved/error without layout shift.
- [ ] Vitest + an E2E responsive-edit path pass; JS gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Site-wide breakpoint configuration (presets + custom add/edit/remove) + persistence + accessor | — | Done |
| 002  | Functional breakpoint switcher from the configured set; active breakpoint drives canvas width | 001 | Done |
| 003  | Desktop-first responsive editing: controls write active-breakpoint overrides; resolver honors cascade | 002 | Done |
| 004  | Inherited/overridden indicators + reset-to-inherited per control | 003 | Done |
| 005  | Top bar: Save draft + Publish (wire Phase 04 persistence) | — | Done |
| 006  | Top bar: autosave indicator (Phase 04 signal, no layout shift) | — | Done |
| 007  | Preview: in-editor clean (chrome-off) view at the active breakpoint | — | Done |
| 008  | Tests (unit + E2E) + polish | 003, 004, 005, 006, 007 | Done |

## Architectural Notes

- **Breakpoint config is the single source** for the switcher, canvas widths, and the
  Phase 08 responsive resolver. Store it site-wide (mirror the Phase 02 settings pattern) and
  expose a typed accessor. Editing/removing a breakpoint must safely handle existing
  per-breakpoint overrides (guard/migrate; warn on remove).
- **Desktop-first cascade:** base = desktop; resolution for the active breakpoint walks from
  base down through wider→active. Define the resolution order **once** — Phase 10's CSS
  generation must match it (max-width media-query direction). Capture shared fixtures.
- Reuse Phase 04 history batching for override edits and the Phase 08 value/unit model.
- Save/Publish call the **Phase 04 persistence actions** (no new logic). The autosave
  indicator consumes the **Phase 04 status signal**, rendered in the Phase 03 reserved slot
  with fixed sizing/opacity so it never reflows the toolbar.
- **Preview** is a UI mode hiding panels/overlays and rendering the canvas cleanly at the
  active breakpoint (still the editor/React render; true front-end preview is Phase 10).
- This phase **closes the editor batch** — create → compose → style → responsive →
  save/publish — with front-end output following in Phase 10.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Editing/removing breakpoints orphans override data | M | M | Guard/migrate overrides on change; warn on remove. |
| Editor (inline) vs Phase 10 (media-query) cascade mismatch | H | M | One canonical desktop-first resolution order; Phase 10 mirrors it; shared fixtures. |
| Inherited/overridden UX confuses users | M | M | Explicit per-control indicators + easy reset (project standard). |
| Autosave indicator causes layout shift | M | L | Fixed-size reserved slot + opacity transitions. |
