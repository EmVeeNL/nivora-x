---
task: 004
phase: 13
title: Conditional Assignment & Precedence Resolver
status: In Review # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 004 — Conditional Assignment & Precedence Resolver

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Build the conditions UI + the precedence resolver that, for a given request, picks the correct
template per type using include/exclude rules (entire-site / post type / specific content /
taxonomy / archive type) with deterministic specificity.

## Context

Multiple templates of a type may exist with overlapping conditions; the resolver must
deterministically choose the most specific match. This drives front-end rendering (task 006).
The conditions UI lets users set where each template applies (reference screenshot 10's
'Conditions').

## Requirements (Test Description)

- **Test:** Given a template's conditions, the UI sets include/exclude rules and persists them.
- **Test:** Given a request context, the resolver returns the most-specific matching template
  per type.
- **Test:** Given overlapping conditions, precedence (specific > taxonomy > post type > site)
  picks deterministically.
- **Test:** Given exclude rules, an excluded context is not matched.
- **Test:** Given no match, a defined fallback (theme default / none) applies.

## Acceptance Criteria

- [ ] Conditions UI (include/exclude rules) persisting on the template.
- [ ] Precedence resolver returning the most-specific match per type for a request.
- [ ] Deterministic specificity ranking with conflict tests.
- [ ] Exclude rules + no-match fallback handled.
- [ ] Pest tests cover resolution; PHPCS + PHPStan clean.

## Files to Create

- `app/templates/conditions/ConditionsEditor.tsx` — include/exclude rule UI.
- `src/Templates/AssignmentResolver.php` — precedence resolver.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Define the specificity order once and document it; this is the contract task 006 depends on.
- Cache resolved assignments per request context; invalidate on template/conditions change.
