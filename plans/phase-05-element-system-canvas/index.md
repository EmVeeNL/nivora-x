---
phase: 05
slug: element-system-canvas
title: Element System & Canvas Rendering
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 05 — Element System & Canvas Rendering

> **Created:** 2026-06-24
> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Make the canvas functional. Define the **element-definition contract** and registry
(element `type` → props/defaults, nesting rules, React render), ship a **minimal starter
set** (Section, Container, Heading, Text), and build the **React renderer** that walks the
Phase 04 document tree and renders it into the Phase 03 iframe canvas — with **single
selection, hover highlight, and a selection overlay** synced to the store. Elements render
with **structural default styling only**; user-configurable styling (Phase 08) and the PHP
renderer + CSS engine / parity (Phase 10) come later.

## Scope

- **Element-definition contract + registry:** `type` → definition bundling props schema +
  defaults, nesting rules, a React render component, and display metadata (label/icon).
  Unknown types fail safe (placeholder, no crash).
- **Starter elements:** **Section** and **Container** (both hold sub-elements), **Heading**
  and **Text** (leaf content rendering their text prop).
- **Nesting rules** from element definitions, wired into the Phase 04 store insert/move
  guards (replacing the placeholder rules).
- **React tree renderer** into the iframe canvas (via the Phase 03 iframe seam), structural
  defaults only, with an **empty-state** placeholder/drop hint.
- **Selection:** click-to-select (single) synced to store selection; **hover highlight**;
  a **selection overlay** outlining the active element and tracking its position/size.
- Vitest coverage (registry, per-element render, selection/overlay); JS gates green.

## Out of Scope

- Element Library palette + **drag-and-drop** — Phase 06.
- **Inspector controls** / functional prop editing — Phase 08.
- **User-configurable styling**, design tokens — Phases 08 / 13.
- **PHP renderer + CSS generation + React↔PHP parity** — Phase 10.
- **Inline rich-text editing** (Tiptap) of Heading/Text — later phase; text comes from props.
- **Multi-select**, and elements beyond the starter four (Button, Image, …).

## Success Criteria

- [ ] An element registry maps `type` → definition; unknown types render a safe placeholder.
- [ ] Section, Container, Heading, Text are registered (defaults + nesting rules + render).
- [ ] The renderer walks a Phase 04 document tree and renders nested Section → Container →
      content in the iframe canvas.
- [ ] Nesting rules are enforced (Heading/Text take no children; Section/Container do).
- [ ] Clicking selects one element (store selection updates); hover highlights; the overlay
      outlines the active element and tracks its rect.
- [ ] An empty document renders a placeholder/drop hint.
- [ ] Elements render with structural defaults only (no user styling).
- [ ] Vitest covers registry/render/selection; lint/format/typecheck pass.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Element-definition contract + registry (type → definition; safe fallback) | — | Not Started |
| 002  | Starter element set (Section, Container, Heading, Text) + nesting rules | 001 | Not Started |
| 003  | React tree renderer into the iframe canvas (structural defaults + empty state) | 001, 002 | Not Started |
| 004  | Single-select + hover highlight, synced to the store | 003 | Not Started |
| 005  | Selection/hover overlay (outline active element; track rect) | 004 | Not Started |
| 006  | Tests + polish (registry/render/selection coverage; matches the shell) | 002, 003, 004, 005 | Not Started |

## Architectural Notes

- The **element definition is the extensibility seam** — one registration per element
  bundling props/defaults/nesting/React-render now, designed **parity-aware** so the PHP
  render (Phase 10) and inspector control schema (Phase 08) slot in later without a rewrite.
- The renderer reads the Phase 04 store and renders into the Phase 03 iframe seam;
  structural default styles live in each element's render, not in user data.
- **Nesting rules come from element definitions** and replace the placeholder guards in the
  Phase 04 store ops — wire them in here.
- The **selection overlay renders in the editor chrome** but maps to iframe element rects
  (`getBoundingClientRect` + resize/scroll observers). **Centralize the coordinate mapping**
  — Phase 06 drag-and-drop reuses it.
- Keep elements presentational/declarative; no bespoke per-element logic beyond render +
  rules. Memoize per node (keyed by node id) for large-tree performance.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Overlay↔iframe coordinate mapping is fiddly (scroll/zoom/cross-document rects) | M | H | Centralize mapping + observers; build once, reuse in Phase 06. |
| Element contract too rigid for future PHP render / controls | M | M | Design parity-aware slots now, even if unimplemented this phase. |
| Structural defaults drift from eventual front-end look | L | M | Keep defaults minimal + documented; real parity is Phase 10. |
| Render performance on large trees | M | L | Memoize per-node; stable keys by node id. |
