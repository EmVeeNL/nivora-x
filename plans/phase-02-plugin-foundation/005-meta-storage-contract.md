---
task: 005
phase: 02
title: Node-Tree Meta Storage Contract
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 005 — Node-Tree Meta Storage Contract

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Define and implement the storage **contract** for NivoraX layout data: a versioned JSON
envelope stored in a single post-meta key, with typed read/write access. This fixes the
*envelope* only — the element schema itself is deferred to Phase 04.

## Context

Everything that persists layout (the Phase 04 store, task 009's front-end switch) reads and
writes through this contract. By freezing the envelope (meta key + version + a `tree`
payload) now, later phases can evolve the element schema and migrate forward without
changing where/how data is stored.

## Requirements (Test Description)

- **Test:** Given a post, writing a layout envelope persists JSON to the defined meta key
  and reading returns an equivalent structure (round-trip).
- **Test:** Given the envelope, it includes a schema `version` and a `tree` payload;
  reads of a missing key return a well-formed empty default.
- **Test:** Given malformed stored JSON, the reader fails safe (returns the empty default,
  logs/flags) rather than fataling.
- **Test:** Write access is capability-gated.

## Acceptance Criteria

- [ ] Single meta key (e.g. `_nivorax_data`) holds a versioned JSON envelope
      (`{ version, tree, … }`).
- [ ] Typed read/write API with a well-formed empty default.
- [ ] Reader is resilient to malformed/missing data (fail-safe).
- [ ] Writes are capability-gated.
- [ ] Passes PHPCS + PHPStan; covered by tests (round-trip + fail-safe).

## Files to Create

- `src/Storage/DocumentStore.php` — read/write the meta envelope (PHP side).
- `src/Storage/Envelope.php` — envelope value object + empty default.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- The element/node schema is NOT defined here — `tree` is an opaque payload for now;
  Phase 04 gives it structure and a validator.
- Keep the version field so Phase 04's migration mechanism can upgrade envelopes.
- Share the meta key constant with tasks 004 and 009.
