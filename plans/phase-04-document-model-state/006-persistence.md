---
task: 006
phase: 04
title: Persistence — Load / Save Draft / Publish
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 004]
retry_count: 0
---

# Task 006 — Persistence — Load / Save Draft / Publish

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 004
> **Retry count:** 0

## Description

Wire the document store to WordPress persistence: load a document into the store on editor
open, and save it back to the Phase 02 meta storage, with distinct **Save draft** and
**Publish** semantics — over a REST endpoint.

## Context

The Phase 02 storage contract (`_nivorax_data` envelope) is the persistence target; this
task adds the REST layer + client wiring that the store uses. Save draft persists
work-in-progress; Publish persists and marks the post/mode as the live version (the
front-end switch from Phase 02 reads it). The save/publish *buttons* live in Phase 09; this
task exposes the actions they call.

## Requirements (Test Description)

- **Test:** Given an editor open for a post, the stored envelope loads and hydrates the
  store (validated via task 002).
- **Test:** Given Save draft, the current tree serializes and persists to the post meta;
  reloading restores it.
- **Test:** Given Publish, the document persists and is marked live so the front-end switch
  renders it.
- **Test:** Given save requests, they are capability-gated, nonce/auth-checked, and reject
  invalid documents.
- **Test:** Given a version conflict (stale base), the save is guarded (last-write-wins with
  version check or a conflict signal).

## Acceptance Criteria

- [ ] REST endpoints (load/save/publish) with capability + nonce checks.
- [ ] Load hydrates the store through validation.
- [ ] Save draft vs Publish behave distinctly and persist to the Phase 02 contract.
- [ ] Version-guarded writes.
- [ ] Vitest (client) + PHP tests (endpoints) cover the flows; all lint/static gates pass.

## Files to Create

- `app/document/persistence.ts` — client load/save/publish actions.
- `src/Rest/DocumentController.php` — REST endpoints over the Phase 02 storage.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 02 `DocumentStore`/`Envelope` (PHP) — the REST controller is a thin,
  guarded wrapper, not new storage.
- Keep the request/response envelope identical to the stored shape so Phase 10 PHP parity is
  trivial.
- Expose load/save/publish as plain store actions so the Phase 09 toolbar just calls them.
