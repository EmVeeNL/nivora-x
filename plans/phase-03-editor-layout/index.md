---
phase: 03
slug: editor-layout
title: Editor Layout
created: 2026-06-24
status: In Progress # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 03 — Editor Layout

> **Created:** 2026-06-24
> **Status:** In Progress <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Draft — captured from decisions on 2026-06-24, awaiting review.

## Objective

Build the static three-panel editor **shell** that matches the reference design
(`00-original-style-reference.png`): a top toolbar, a left "Navigation" panel, a center
iframe canvas scaffold, a right "Body" inspector panel, and a bottom breadcrumb bar —
styled with **Tailwind v4 + ShadCN** in the dark theme and filled with **placeholder
content**. It includes only local UI/layout state and a defined set of visual-only shell
behaviors. No document state, no data wiring, no functional tree/inspector/canvas
rendering, and no drag-and-drop — those arrive in later feature phases.

## Scope

- **Tailwind v4 + ShadCN** set up for the editor app (deferred here from Phase 01), with
  dark-theme tokens approximating the reference.
- Mount the editor shell into the **Phase 02 placeholder editor screen** (full-screen).
- **Top toolbar:** project/title (left), device/breakpoint switcher (center),
  Preview + Publish buttons (right) — buttons are **visual/non-functional**.
- **Left "Navigation" panel:** a placeholder layer tree (static representative hierarchy).
- **Center canvas:** an **empty iframe scaffold** with a placeholder; its width is driven
  by the breakpoint switcher.
- **Right "Body" inspector panel:** working tabs (e.g. Style / Settings) and collapsible
  sections (Layout, Spacing, Size, Typography…) containing **placeholder controls**.
- **Bottom breadcrumb bar:** static breadcrumb (e.g. Body › Page Wrapper › … › Heading)
  plus placeholder indicators.
- **Shell behaviors (visual only):** collapsible left/right panels; breakpoint/device
  width switch changing the canvas frame width; working inspector tabs + section collapse.
- **Local UI state only** (panel visibility, active breakpoint, active tab, section
  open/closed) — ephemeral, never written to a document.
- Layout/visual polish to match the reference; Vitest component tests; ESLint/Prettier/tsc
  clean.

## Out of Scope

- **Resizable panels** — explicitly deferred (panels are fixed-width but collapsible).
- Document/node **state store**, selection, undo/redo.
- Real layer-tree **data + interaction** (select/reorder/visibility wired to a document).
- **Functional inspector controls** bound to nodes.
- **Canvas node rendering** — the iframe stays an empty scaffold.
- **Drag and drop.**
- **Save / Publish / Preview** functionality — buttons are visual.
- The node-tree **schema** — still deferred to a feature phase.

## Success Criteria

- [ ] The editor shell mounts full-screen in the Phase 02 editor screen and visually
      matches the reference (top bar · left nav · center canvas · right inspector ·
      bottom breadcrumb).
- [ ] Tailwind v4 + ShadCN are configured for the editor with the dark theme.
- [ ] Left and right panels collapse/expand; collapsing maximizes the canvas.
- [ ] The breakpoint/device switcher changes the canvas iframe width.
- [ ] Inspector tabs switch and sections collapse/expand, showing placeholder controls.
- [ ] The center is an isolated iframe scaffold with a placeholder (no node rendering).
- [ ] Only local UI state is used; nothing writes to a document.
- [ ] Vitest component tests cover the shell behaviors; ESLint/Prettier/tsc are clean.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Tailwind v4 + ShadCN setup + editor dark-theme tokens; mount shell into the Phase 02 screen | — | Done |
| 002  | Editor layout scaffold (three-panel grid + toolbar/breadcrumb regions) + local UI-state store | 001 | Done |
| 003  | Top toolbar: title, device/breakpoint switcher (wired to UI state), Preview/Publish (visual) | 002 | Done |
| 004  | Left Navigation panel (placeholder layer tree) + collapse | 002 | Done |
| 005  | Center iframe canvas scaffold; width bound to the active breakpoint | 002, 003 | Not Started |
| 006  | Right inspector panel: tabs + collapsible sections + placeholder controls | 002 | Not Started |
| 007  | Bottom breadcrumb bar (static placeholder) | 002 | Not Started |
| 008  | Visual polish pass to match the reference + component tests | 003, 004, 005, 006, 007 | Not Started |

## Architectural Notes

- Builds on the Phase 02 placeholder editor screen (the shell mounts there) and the
  Phase 01 Vite/React + asset integration.
- **Tailwind v4 + ShadCN are scoped to the editor chrome only**, never canvas content
  (per `AGENTS.md`). The canvas is an iframe from the start for isolation/front-end parity,
  even while empty.
- Keep the **local UI state separate** from the future document store so that store can
  slot in later without refactoring the shell.
- The reference screenshot is the visual target — aim for a **close match**, not
  pixel-perfect; task 008 is the dedicated design/polish pass (project convention: polish
  before features).

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Tailwind v4 + ShadCN integration quirks (v4 is newer) | M | M | Validate the setup early in task 001 before building panels. |
| Visual drift from the reference | M | M | Keep the screenshot as reference; dedicated polish task (008). |
| iframe theming/placeholder setup is fiddly | M | M | Spike the iframe scaffold in task 005; keep it minimal. |
| Scope creep into real functionality | M | M | Everything stays placeholder/visual; explicit out-of-scope list. |
