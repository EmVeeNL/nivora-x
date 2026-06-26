---
phase: 12
slug: full-styling-controls
title: Full Styling Controls
created: 2026-06-24
status: In Progress # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 12 — Full Styling Controls

> **Created:** 2026-06-24
> **Status:** In Progress <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Expand the inspector to the full styling surface — **Background**, **Border & Box-shadow**,
**Position & Overflow**, and **Advanced Layout (flex/grid)** controls — plus **per-state
styling** (default / hover / focus / active) and a **Custom CSS / custom-class** escape
hatch. Style props gain a **state dimension** alongside the responsive dimension; the
resolver (Phase 09) and both CSS generators (Phase 10) extend to emit pseudo-class CSS. All
controls are declarative (Phase 08) and token-aware (Phase 11).

## Scope

- **New control groups** (declarative + token-aware):
  - **Background:** color, gradient, image (position/size/repeat).
  - **Border & Box-shadow:** border width/style/color, radius, box-shadow.
  - **Position & Overflow:** position, offsets, z-index, overflow, visibility.
  - **Advanced Layout:** full flex (align/justify/wrap/gap) + grid (templates/areas).
- **Interaction states:** style props gain a state dimension (default + hover/focus/active);
  an inspector **state switcher**; both CSS generators emit pseudo-class rules
  (`.nivorax-<id>:hover` …); the resolver composes **state × breakpoint**.
- **Custom CSS escape hatch:** per-element custom CSS **classes** + a node-scoped custom CSS
  **snippet** (sanitized, scoped under `.nivorax-<id>`).
- Extend the resolver, both CSS generators, token integration, and the **parity fixtures** to
  the state dimension + new controls.
- Editor previews the **active editing-state** (so hover styles are visible while editing).

## Out of Scope

- **Transitions / animations / motion interactions** — later phase.
- **Theme builder / templates** — Phase 13.
- **Component & pattern library** — Phase 15.

## Success Criteria

- [ ] Background, Border & Box-shadow, Position & Overflow, Advanced Layout groups added
      (declarative, token-aware).
- [ ] Style props support per-state values (default/hover/focus/active) with a state switcher.
- [ ] Both CSS generators emit pseudo-class rules; the resolver handles state × breakpoint.
- [ ] Custom CSS classes + a node-scoped custom CSS snippet are supported and rendered safely.
- [ ] The editor canvas previews the active editing-state.
- [ ] Parity fixtures cover states + new controls + custom CSS (JS == PHP).
- [ ] Pest + Vitest + the parity harness pass; all gates green.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Style-prop state dimension (model + resolver: state × breakpoint) + inspector state switcher | — | Done |
| 002  | Background controls (color/gradient/image) | 001 | Done |
| 003  | Border & Box-shadow controls | 001 | Done |
| 004  | Position & Overflow controls | 001 | Not Started |
| 005  | Advanced Layout controls (flex/grid) | 001 | Not Started |
| 006  | Pseudo-class CSS emission for states in both generators (JS + PHP) | 001 | Not Started |
| 007  | Custom CSS classes + node-scoped custom CSS snippet (render + generate, sanitized) | — | Not Started |
| 008  | Parity fixtures (states + new controls + custom CSS) + tests + polish | 002, 003, 004, 005, 006, 007 | Not Started |

## Architectural Notes

- **States are a dimension parallel to responsive:** a style value is per-state
  (default/hover/focus/active), each holding the Phase 04 responsive `{ base, <bp> }`. The
  resolver composes **state × breakpoint**; generators emit `.nivorax-<id>:hover` rules
  (+ media queries). Extend the model consistently across Phases 04/08/09/10/11 — don't fork.
- All new controls stay **declarative** (Phase 08 schema) + **token-aware** (Phase 11).
- **Custom CSS:** custom classes append to the node's class list; the scoped snippet is wrapped
  under the node's `.nivorax-<id>` scope by the generators. **Sanitize + capability-gate** —
  it's user input rendered to the page.
- The editor previews the **active editing-state** via a state-preview flag (so hover styles
  show while editing, distinct from real pointer hover).
- Extend the **Phase 10/11 parity harness** to states + new controls + custom CSS first, so
  JS == PHP stays enforced as the model grows.
- Inspector polish in this phase keeps the standard right-panel shell intact while replacing
  high-friction generic field groups with dedicated editors where needed (for example border
  and spacing). Default inspector load state is intentionally conservative: **Layout** starts
  open and the remaining sections start collapsed.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| State × breakpoint × token combinatorial complexity | H | M | One canonical resolution order; shared fixtures; extend (not fork) the resolver/generators. |
| Custom CSS security (injection) | H | M | Sanitize + scope under the node class + capability-gate; document. |
| Parity drift with the new state dimension | H | M | Extend the parity harness first; states in fixtures. |
| Editor hover-preview vs real hover confusion | M | M | Explicit state-preview UI separate from pointer hover. |
