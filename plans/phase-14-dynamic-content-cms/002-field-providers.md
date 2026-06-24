---
task: 002
phase: 14
title: Field-Provider Abstraction & Native Providers
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Field-Provider Abstraction & Native Providers

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Define the field-provider abstraction (list available fields + resolve a field for a context)
and implement native providers: core post fields, custom fields (post meta), taxonomies &
terms, and author & site.

## Context

Providers decouple binding from data access so ACF/Meta Box/Pods can plug in later. They must
expose a field catalog (for the binding UI) and a resolver (for rendering). This is the data
backbone of dynamic content.

## Requirements (Test Description)

- **Test:** Given each native provider, it lists its available fields for a context.
- **Test:** Given a field + context, the provider resolves the value (e.g. post title,
  meta key, term list, author name, site title).
- **Test:** Given a missing field/value, resolution returns the binding fallback.
- **Test:** Given the provider seam, a stub third-party provider can register and be used.
- **Test:** Providers pass PHPCS + PHPStan.

## Acceptance Criteria

- [ ] Provider interface (list fields + resolve) + a registry/seam.
- [ ] Native providers: core post fields, post meta, taxonomies/terms, author & site.
- [ ] Fallback handling on missing data.
- [ ] Extensible for ACF/etc. via the seam.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Dynamic/FieldProviderInterface.php` — provider contract.
- `src/Dynamic/Providers/` — core/meta/taxonomy/author+site providers.
- `src/Dynamic/ProviderRegistry.php` — registry + seam.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- The field catalog feeds the binding UI (task 003) over REST; the resolver feeds rendering
  (task 004) + preview (task 005).
- Keep the seam minimal; ship native providers concretely.
