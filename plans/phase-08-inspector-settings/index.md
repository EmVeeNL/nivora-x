---
phase: 08
slug: inspector-settings
title: Inspector & Settings
created: 2026-06-24
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 08 — Inspector & Settings

> **Created:** 2026-06-24
> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Build the functional right panel — tabs **Page / Block / Inspector** — driven by a
**declarative control schema per element**. Page = page-level settings (title, …); Block =
the selected element's content props; Inspector = foundational styling (Layout, Spacing,
Size, Typography). Controls bind to the selected node via the Phase 04 store (undoable), and
style edits apply to the canvas **live, resolved for the active breakpoint** via an interim
inline-style application behind a seam that Phase 10 replaces with real CSS generation.
Replaces the Phase 03 placeholder inspector and fills the control-schema slot reserved in
Phase 05.

## Scope

- Replace Phase 03 inspector placeholders with functional **Page / Block / Inspector** tabs.
- **Declarative control-schema system:** a generic renderer maps a schema → ShadCN controls
  (text, number, select, toggle, color, slider, spacing box, …) bound to node props via
  store ops; continuous edits coalesce into single undo entries.
- **Per-element control schemas** for the starter set (Section, Container, Heading, Text):
  Block (content props) + Inspector (style) controls.
- **Page tab:** page-level settings — title and a couple of basics — persisted via the
  Phase 04/02 persistence.
- **Foundational style controls** (Inspector tab): Layout (display/flex basics), Spacing
  (padding/margin), Size (width/height/max), Typography (font/size/weight/line-height/color).
- **Editor-side style application:** resolve a node's style props for the **active
  breakpoint** and apply inline to the canvas so edits render live — behind a seam Phase 10
  swaps for generated scoped CSS.
- No-selection and locked states handled; Vitest coverage.

## Out of Scope

- **Per-breakpoint responsive editing UI** — Phase 09. Controls edit the **base** value
  here (the style-prop shape already supports breakpoints from Phase 04).
- Full styling **controls** — Phase 12; **design tokens** — Phase 11 (foundational controls
  only here).
- **PHP CSS generation + front-end parity** — Phase 10.
- Inline rich-text editing of Heading/Text — later phase.

## Success Criteria

- [ ] Right panel shows functional Page / Block / Inspector tabs (placeholders removed).
- [ ] A declarative control-schema renderer maps schemas → bound ShadCN controls; editing
      updates the selected node via store ops (undoable, coalesced).
- [ ] Starter elements declare Block + Inspector control schemas; selecting an element shows
      its controls.
- [ ] The Page tab edits the page title (+ basics) and persists.
- [ ] The Inspector tab provides Layout, Spacing, Size, Typography controls writing style props.
- [ ] Style changes apply to the canvas live (resolved for the active breakpoint).
- [ ] No-selection and locked-node states are handled.
- [ ] Vitest covers schema rendering, binding, and style application; JS gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Declarative control-schema system + generic control renderer (ShadCN set) bound to the store | — | Not Started |
| 002  | Right-panel tabs (Page/Block/Inspector) wired + selection-driven (replaces Phase 03 placeholders) | 001 | Not Started |
| 003  | Block tab: per-element content control schemas (starter set) | 001, 002 | Not Started |
| 004  | Inspector tab: foundational style controls (Layout, Spacing, Size, Typography) + style-prop schema | 001, 002 | Not Started |
| 005  | Editor-side style application to canvas (resolve active-breakpoint values → inline, behind a seam) | 004 | Not Started |
| 006  | Page tab: page settings (title + basics) + persistence | 002 | Not Started |
| 007  | Tests + polish (empty/locked states, undo coalescing) | 003, 004, 005, 006 | Not Started |

## Architectural Notes

- The **declarative control schema fills the Phase 05 reserved slot** — each element owns its
  Block + Inspector controls as data; the renderer is generic, so adding an element later is
  "add a schema," not new inspector UI.
- Controls write through **Phase 04 store ops**; coalesce continuous edits (sliders) into
  single undo entries (Phase 04 history batching).
- Style props use the Phase 04 responsive shape `{ base, <bp>: v }`. **Phase 08 edits the
  base**; Phase 09 adds per-breakpoint editing. A **resolver** picks the value for the active
  breakpoint.
- **Editor-side style application is interim and behind a seam:** resolve active-breakpoint
  style props → inline styles on the rendered node. Phase 10 replaces this with generated
  scoped CSS + media queries for the front end (and may unify the editor path for parity).
  Keep the resolver + applier as the seam Phase 10 implements.
- Standardize a **value/unit model** now (px/%/rem, etc.) — reused by Phases 09 / 11.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Per-element bespoke inspector UIs creep in | M | M | Enforce the declarative schema + shared control components. |
| Interim style application diverges from the Phase 10 CSS engine | M | M | Design the resolver/applier as the exact seam Phase 10 implements; document the contract. |
| Control edits spam undo history | L | M | Debounce/coalesce continuous edits into single entries. |
| Inconsistent value/unit handling across controls | M | M | One shared value/unit model, reused by later styling phases. |
