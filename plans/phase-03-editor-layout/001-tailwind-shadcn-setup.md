---
task: 001
phase: 03
title: Tailwind v4 + ShadCN Setup & Editor Theme
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Tailwind v4 + ShadCN Setup & Editor Theme

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Set up Tailwind CSS v4 and ShadCN for the editor app with a dark theme approximating the
reference, and mount the (still-empty) editor shell into the Phase 02 placeholder editor
screen.

## Context

Tailwind/ShadCN were deliberately deferred from Phase 01 to here. They style the **editor
chrome only** — never canvas content (per `AGENTS.md`). This task establishes the design
foundation (tokens, base styles, ShadCN primitives) and proves the app renders inside the
Phase 02 `EditorScreen` mount node.

## Requirements (Test Description)

- **Test:** Given the build, Tailwind v4 compiles and its styles apply to the editor app
  (a themed test element renders with expected styles).
- **Test:** Given ShadCN, a sample primitive (e.g. Button) renders with the dark theme
  tokens.
- **Test:** Given the Phase 02 editor screen, the React app mounts and paints the themed
  shell container.
- **Test:** Editor styles are scoped so they don't leak onto the (future) canvas iframe.

## Acceptance Criteria

- [ ] Tailwind v4 configured and building within the Vite pipeline.
- [ ] ShadCN installed with dark-theme tokens approximating the reference palette.
- [ ] The app mounts into the Phase 02 editor screen and renders a themed root container.
- [ ] Chrome styles are scoped away from canvas content.
- [ ] `pnpm lint`, `format:check`, `typecheck`, `build` all pass.

## Files to Create

- `app/styles/theme.css` — Tailwind v4 entry + design tokens (dark).
- `app/lib/ui/` — ShadCN primitives setup/config.
- `app/EditorApp.tsx` — root app component mounted by the editor screen.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Validate Tailwind v4 + ShadCN interop early (v4 is newer) before building panels — this
  is the phase's main setup risk.
- Pull palette/spacing from the reference screenshot; exact tokens get refined in task 008.
