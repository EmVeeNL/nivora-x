---
task: 007
phase: 12
title: Custom CSS Classes & Scoped Snippet
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 007 — Custom CSS Classes & Scoped Snippet

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** []
> **Retry count:** 0

## Description

Add a per-element Advanced area: custom CSS **classes** (appended to the node) and a node-
scoped custom CSS **snippet**, rendered and generated safely on both the editor and the front
end.

## Context

The escape hatch covers edge cases the controls don't. Custom classes let users hook external
styles; the scoped snippet is wrapped under the node's `.nivorax-<id>` scope. Because it's
user input rendered to the page, sanitization, scoping, and capability gating are essential.

## Requirements (Test Description)

- **Test:** Given custom classes, they are appended to the node's rendered class list (editor
  + front end).
- **Test:** Given a custom CSS snippet, it is scoped under `.nivorax-<id>` and applied in both
  the editor and the front end.
- **Test:** Given a malicious/invalid snippet, it is sanitized (no script/url injection, no
  scope-escape) and fails safe.
- **Test:** Given the Advanced area, it is capability-gated.
- **Test:** JS + PHP produce equivalent scoped output (parity).

## Acceptance Criteria

- [ ] Custom CSS classes appended to the node (editor + front end).
- [ ] Node-scoped custom CSS snippet applied on both sides.
- [ ] Sanitization + scoping + capability gating.
- [ ] JS == PHP scoped output (parity, task 008).
- [ ] Vitest + Pest cover render/generate/sanitize; all gates green.

## Files to Create

- `app/inspector/advanced/CustomCss.tsx` — classes + snippet controls.
- `app/css/scopeCustomCss.ts` — scope/sanitize the snippet (JS).
- `src/Css/CustomCss.php` — scope/sanitize the snippet (PHP).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Scoping approach: prefix selectors with the node class, or wrap in a scope; prevent
  `}`-breakout and `@import`/`url()` abuse. Document the sanitization rules.
- This is a security-sensitive surface — front-end output must be carefully escaped/validated.
