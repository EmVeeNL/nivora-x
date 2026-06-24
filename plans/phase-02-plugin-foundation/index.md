---
phase: 02
slug: plugin-foundation
title: Plugin Foundation
created: 2026-06-24
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 02 — Plugin Foundation

> **Created:** 2026-06-24
> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Build the real plugin foundation on top of Phase 01's bare skeleton: NivoraX's admin
presence (a top-level menu, pages list, new-page flow, and settings), the integration
that makes NivoraX an available editor on existing WordPress post types (Pages, Posts,
and public CPTs) via a settings toggle, the per-page editor-mode handling that lets
NivoraX **coexist with Gutenberg**, and the front-end rendering switch — all covered by
tests and passing PHPCS/ESLint. The actual three-panel editor UI (Phase 03) and the
node-tree element schema (deferred) are **out of scope**; the editor screen here is a
placeholder mount point.

## Scope

- Top-level **NivoraX** admin menu: **All Pages**, **New Page**, **Settings**.
- **Settings page** (WP Settings API): which post types NivoraX is enabled on
  (Pages / Posts / public CPTs toggles), plus a small set of placeholder general options.
- **Post-type integration (augment, Elementor-style):** on enabled post types, expose an
  "Edit with NivoraX" affordance on the native edit screen and a row action in list tables.
- **Per-page editor mode** (post meta flag): active editor is `nivorax` or `default`;
  switching between NivoraX and Gutenberg preserves each side's content separately, with
  **no auto-conversion** (mode toggle, not sync).
- **All Pages screen:** the native pages list augmented with a NivoraX column + filter
  (which pages are built with NivoraX).
- **New Page flow:** creates a native page draft and routes to the NivoraX editor screen.
- **Placeholder editor screen:** a full-screen admin screen that mounts the Phase 01
  Vite/React app container — no real editor yet.
- **Front-end rendering switch:** when a post's mode is `nivorax`, render from the
  NivoraX node-tree meta (placeholder output for now) instead of `post_content`;
  otherwise default behavior is untouched.
- **Storage contract:** node tree stored as JSON in a defined post-meta key with a
  versioned envelope (placeholder/empty structure for now; element schema deferred).
- **Capabilities:** gate NivoraX admin screens and actions behind appropriate caps.
- **Tests + lint:** Pest/PHPUnit (and JS where relevant) cover the above; PHPCS + ESLint
  clean — using the Phase 01 tooling.

## Out of Scope

- The three-panel editor UI / canvas / inspector — **Phase 03**.
- The node-tree **element schema** + validation — deferred; Phase 02 fixes only the
  storage *contract* (meta key + JSON envelope + version), not element definitions.
- Real element rendering + CSS generation — later phases; the front-end switch renders a
  placeholder when in NivoraX mode.
- Block → node conversion or live two-way sync — explicitly not doing (mode toggle only).
- Templates / theme-builder CPT (headers, footers, parts) — later phase.
- Licensing/activation and i18n polish — later.

## Success Criteria

- [ ] A top-level NivoraX menu shows All Pages, New Page, and Settings.
- [ ] Settings persist which post types NivoraX is enabled on; toggling changes where the
      "Edit with NivoraX" affordance appears.
- [ ] On an enabled post type, the native edit screen and list row offer "Edit with
      NivoraX"; disabled post types do not.
- [ ] "New Page" creates a native page draft and opens the placeholder editor screen.
- [ ] A per-page mode flag is stored; switching editors flips it; the front end renders
      per the active mode (NivoraX placeholder vs native content) without destroying the
      other side's content.
- [ ] The All Pages list shows a NivoraX-built indicator and can filter by it.
- [ ] All NivoraX admin screens/actions are capability-gated.
- [ ] Node-tree meta read/write works against the defined key + versioned envelope.
- [ ] Pest/PHPUnit + JS tests cover the above and pass; PHPCS + ESLint are clean.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Top-level NivoraX admin menu + screen routing (All Pages, New Page, Settings shells) | — | Not Started |
| 002  | Settings page (Settings API) incl. enabled-post-types toggles | 001 | Not Started |
| 003  | Post-type integration: "Edit with NivoraX" affordances (edit screen + list row), capability gating | 001, 002 | Not Started |
| 004  | Per-page editor mode flag + NivoraX⇄Gutenberg switch handling (preserve both sides) | 003 | Not Started |
| 005  | Node-tree meta storage contract (defined key, versioned JSON envelope, read/write) | 001 | Not Started |
| 006  | All Pages screen: native list augmentation (NivoraX column + filter) | 003, 004 | Not Started |
| 007  | New Page flow: create native draft + route to editor screen | 001, 008 | Not Started |
| 008  | Placeholder full-screen editor screen (mounts the Phase 01 React container) | 001 | Not Started |
| 009  | Front-end rendering switch (render placeholder from meta when mode = nivorax) | 004, 005 | Not Started |

## Architectural Notes

- Builds directly on Phase 01: the minimal skeleton (task 004) and the Vite↔WP asset
  integration (task 008). The placeholder editor screen reuses that React mount.
- **Storage mirrors Elementor:** node tree JSON in post meta (e.g. `_nivorax_data`),
  mode flag in meta (e.g. `_nivorax_edit_mode`); `post_content` stays the Gutenberg
  source of truth. The two never auto-sync — the mode flag decides what renders.
- The **enabled-post-types** setting is the single source consulted by the integration
  affordances, the All Pages augmentation, and the front-end switch — keep it centralized.
- The element **schema is deferred**; here we only freeze the storage envelope (key +
  version field) so later phases can migrate content forward.
- Capabilities: reuse/extend WP caps; register any custom capability in `phpcs.xml` per
  project conventions so PHPCS stays quiet.
- Each task is test-driven (Requirements describe the tests); no separate "testing" task.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Coexistence edge cases (which editor renders after a switch) | M | M | Explicit mode flag + tests for every NivoraX⇄Gutenberg transition. |
| Front-end takeover conflicts with theme/other plugins on `the_content` | M | M | Well-scoped render hook + priority; test against a default theme. |
| Scope creep into the real editor | M | M | Keep the editor screen a strict placeholder; real UI is Phase 03. |
| Public-CPT enablement variety | L | M | Test enablement against at least one custom CPT, not just Pages/Posts. |
