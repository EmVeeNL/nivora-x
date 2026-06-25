---
task: 001
phase: 06
title: Left Icon-Rail & Panel-Switching System
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Left Icon-Rail & Panel-Switching System

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Build the generic left mini icon-rail and panel-switching system: a registry of left panels
(icon + component), with the active panel shown in the left area and collapse behavior, all
driven by the Phase 03 UI store.

## Context

This replaces the Phase 03 single left panel with a switchable, extensible system. Element
Library registers as the first panel (task 002); Navigator registers as the second in
Phase 07; future panels (e.g. tokens, components) plug in later. Keeping it generic now
avoids rework as panels grow.

## Requirements (Test Description)

- **Test:** Given registered panels, the rail renders one icon per panel in order.
- **Test:** Given a rail icon click, that panel becomes active and renders in the left area.
- **Test:** Given a click on the active panel's icon, the left panel collapses; clicking
  again re-opens it.
- **Test:** Active-panel + collapse state persist in the Phase 03 UI store.
- **Test:** Registering a new panel makes it appear without changes to the rail component.

## Acceptance Criteria

- [x] Panel registry (icon + label + component) with ordered registration.
- [x] Icon-only rail; clicking switches the active panel; active icon toggles collapse.
- [x] Active-panel/collapse state in the UI store.
- [x] Extensible: new panels appear by registration alone.
- [x] Vitest covers switching/collapse; lint/format/typecheck pass.

## Files to Create

- `app/shell/left/LeftRail.tsx` — icon rail.
- `app/shell/left/leftPanelRegistry.ts` — panel registry.
- `app/shell/left/LeftPanelHost.tsx` — renders the active panel.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 03 `LeftPanel` collapse wiring; generalize it to host any registered panel.
- Navigator (Phase 07) and future panels register through `leftPanelRegistry` — keep its API
  stable.
