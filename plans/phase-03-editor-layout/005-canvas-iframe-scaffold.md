---
task: 005
phase: 03
title: Center iframe Canvas Scaffold
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003]
retry_count: 0
---

# Task 005 — Center iframe Canvas Scaffold

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003
> **Retry count:** 0

## Description

Build the center canvas as an isolated **iframe scaffold** with a placeholder inside, and
bind its frame width to the active breakpoint from UI state. No node rendering yet.

## Context

The canvas is an iframe from the start for style isolation and future front-end parity —
even while empty. The breakpoint switcher (task 003) sets the active breakpoint; the canvas
reads it to resize (desktop/tablet/mobile widths). The real React renderer fills this iframe
in Phase 05.

## Requirements (Test Description)

- **Test:** Given the canvas, it renders an iframe with a visible placeholder inside.
- **Test:** Given a breakpoint change in UI state, the iframe frame width updates to the
  corresponding preset width (centered, with surrounding canvas chrome).
- **Test:** Given the iframe, editor (Tailwind/ShadCN) styles do not leak into it.
- **Test:** The iframe is set up to accept future injected content/styles (documented seam).

## Acceptance Criteria

- [ ] Isolated iframe canvas with a placeholder.
- [ ] Frame width bound to the active breakpoint (preset widths), centered with chrome.
- [ ] Verified style isolation from the editor chrome.
- [ ] A documented seam for injecting content/styles later (Phase 05).
- [ ] Vitest covers width-binding; lint/format/typecheck pass.

## Files to Create

- `app/canvas/CanvasFrame.tsx` — iframe scaffold + width binding.
- `app/canvas/iframe.ts` — iframe document bootstrap helper (seam for later injection).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Spike the iframe bootstrap (writing a base document + style tag) minimally here; Phase 05
  builds real rendering on this seam.
- Keep preset widths sourced from the same place as the breakpoint switcher (task 003).
