---
task: 008
phase: 04
title: Schema Versioning & Migration Mechanism
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 008 — Schema Versioning & Migration Mechanism

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Implement the schema versioning + migration mechanism so documents stored at an older schema
version are upgraded to the current version on load, with a working no-op migration as the
first registered migration.

## Context

The element schema will evolve heavily across later phases; without migrations, older saved
documents would break. Establishing the mechanism now (even with only a no-op migration)
means every future schema change ships with a migration and old content keeps loading.

## Requirements (Test Description)

- **Test:** Given a document at the current version, load applies no migrations and returns
  it unchanged.
- **Test:** Given a document at an older version, the migration runner applies the ordered
  migrations up to current and stamps the new version.
- **Test:** Given the no-op migration registered between two versions, it runs and advances
  the version without altering content.
- **Test:** Given an unknown/newer version, loading fails safe with a clear error rather than
  corrupting data.

## Acceptance Criteria

- [ ] Ordered migration runner keyed by schema version.
- [ ] A registered no-op migration demonstrating the mechanism.
- [ ] Load path runs migrations to bring documents to the current version.
- [ ] Safe handling of unknown/newer versions.
- [ ] Vitest covers up-migration + no-op + failure; lint/format/typecheck pass.

## Files to Create

- `app/document/migrations/index.ts` — migration registry + runner.
- `app/document/migrations/0001-initial.ts` — initial/no-op migration.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Run migrations inside the load path (task 006) before validation/hydration.
- Keep migrations pure and ordered; each future schema change adds one file here.
- When Phase 10 adds PHP parity, mirror the version checks server-side.
