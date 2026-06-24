---
task: 006
phase: 11
title: Reference Integrity & Live Propagation
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 003]
retry_count: 0
---

# Task 006 — Reference Integrity & Live Propagation

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 003
> **Retry count:** 0

## Description

Ensure token references stay valid through rename/delete (guard + warn + reassignment) and
that token edits propagate live to all referencing nodes in the editor.

## Context

Id-based references survive renames automatically, but deletion can orphan references. This
task adds the safety UX and confirms live propagation works end to end (token edit → variable
update → every referencing node reflects it without per-node rework).

## Requirements (Test Description)

- **Test:** Given a token rename, all references remain valid (id-based) and display the new
  name.
- **Test:** Given a delete of a referenced token, the user is warned and can reassign or
  confirm; references are not silently orphaned.
- **Test:** Given an orphaned reference (forced), resolution falls back safely (defined rule).
- **Test:** Given a token value edit, every referencing node updates live in the editor.

## Acceptance Criteria

- [ ] Rename preserves references (id-based).
- [ ] Delete-with-references is guarded (warn + reassign/confirm).
- [ ] Defined safe fallback for orphaned references.
- [ ] Live propagation of token edits to all referencing nodes in the editor.
- [ ] Vitest covers integrity + propagation; lint/format/typecheck pass.

## Files to Create

- `app/tokens/integrity.ts` — reference lookup, delete guard, reassignment, fallback.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- "Find references" needs to scan the document tree (and potentially templates later) — keep
  it efficient.
- Fallback for orphaned refs: resolve to a neutral value + flag; never break rendering.
