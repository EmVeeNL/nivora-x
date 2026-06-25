---
phase: 04
slug: document-model-state
title: Document Model & State
created: 2026-06-24
status: Done # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 04 — Document Model & State

> **Created:** 2026-06-24
> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Define the **node-tree data model** that is the editor's single source of truth, and
build the **document state layer** on top of it: loading from and saving to the Phase 02
post-meta storage, tracking selection, applying tree mutations, undo/redo, and autosave.
This is the foundation every functional editor phase (05–09) builds on. There is no UI
here beyond what's needed to exercise the store; the canvas, library, navigator, and
inspector consume this in later phases.

## Scope

- **Node-tree schema:** node shape — `id`, `type`, `props`, `children`, per-breakpoint
  responsive `overrides`, and metadata (name, visibility, lock) — inside a **versioned
  envelope**. TypeScript types are the source of truth this batch.
- **Stable node IDs** (for selection, undo, and future CSS scoping).
- **Schema validation** + lossless JSON serialize/deserialize.
- **Document store:** holds tree + selection; **pure, typed mutation ops** — insert,
  move, update props, duplicate, remove — as the single path for all tree changes.
- **Undo/redo** history over those mutations.
- **Persistence:** load/save the document to the Phase 02 storage contract
  (`_nivorax_data` envelope), with distinct **Save draft** vs **Publish** semantics.
- **Autosave:** debounced background save exposing a status signal (idle / saving /
  saved) for the top-bar indicator (UI lands in Phase 09), designed to be
  non-layout-shifting.
- **Schema versioning + migration** mechanism (with a no-op migration).
- Vitest coverage for schema, mutations, undo/redo, persistence, and round-trip.

## Out of Scope

- Actual **element definitions / rendering** — Phase 05 (schema defines the *shape*, not
  the catalog of element types).
- **PHP value objects, front-end rendering, CSS generation** — later front-end batch
  (Phase 10).
- Canvas, Element Library, Navigator, Inspector **UIs** — Phases 05–08.
- The autosave **notification UI** and the **save/preview/publish buttons** — Phase 09
  (here we provide only the store logic + status they bind to).

## Success Criteria

- [ ] A node tree validates against the schema; malformed trees are rejected (tests).
- [ ] JSON round-trips losslessly (serialize → deserialize).
- [ ] Store mutations (insert/move/update/duplicate/remove) produce correct trees and are
      pure and typed.
- [ ] Undo/redo correctly reverts/replays any sequence of mutations.
- [ ] A document loads from and saves to the Phase 02 meta storage; Save draft vs Publish
      behave distinctly.
- [ ] Autosave debounces and exposes an idle/saving/saved status without requiring layout
      space.
- [ ] The schema version is stored with the document; a no-op migration runs via the
      migration mechanism.
- [ ] Vitest covers schema, mutations, undo/redo, persistence, and round-trip.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Node-tree schema + TS types + versioned envelope | — | Done |
| 002  | Schema validation + serialization (lossless round-trip) | 001 | Done |
| 003  | Stable node ID generation | 001 | Done |
| 004  | Document store: state shape + pure mutation ops (insert/move/update/duplicate/remove) | 001, 003 | Done |
| 005  | Undo/redo history over mutations | 004 | Done |
| 006  | Persistence: load/save to Phase 02 meta (Save draft vs Publish) | 002, 004 | Done |
| 007  | Autosave (debounced) + status signal | 006 | Done |
| 008  | Schema versioning + migration mechanism (no-op migration) | 002 | Done |

## Architectural Notes

- **TS types are the source of truth this batch.** PHP value objects + React/PHP render
  parity arrive in the front-end batch (Phase 10); keep serialization stable so PHP can
  mirror it later without schema changes.
- **All tree changes route through the store's pure mutation ops** — canvas, navigator,
  inspector, and DnD (Phases 05–08) share that single path, which keeps undo and
  persistence consistent.
- **Responsive overrides** are modeled per styleable prop as `{ base, <breakpoint>: … }`.
  The breakpoint *set* is finalized in Phase 09, but the *shape* is fixed here.
- **Persistence reuses the Phase 02 contract** (`_nivorax_data` envelope + version + mode
  flag) — no new storage is invented.
- **Autosave is a status signal only**; the non-layout-shifting indicator UI lives in
  Phase 09 (e.g. fixed-position / opacity, never reflowing the toolbar).
- Keep **document state separate from Phase 03's local UI state**, so the two layers
  evolve independently.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Schema churn cascades into Phases 05–09 | H | M | Version + validate from day one; treat changes as migrations. |
| Undo/redo retrofit is costly | M | M | Build history into the store now, not later. |
| Autosave races with manual save / publish | M | M | Single persistence queue; last-write-wins guarded by the version field. |
| Over-modeling before elements exist | M | M | Keep `props` a loosely-validated open map until element schemas land in Phase 05. |
