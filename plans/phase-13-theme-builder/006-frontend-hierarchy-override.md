---
task: 006
phase: 13
title: Front-End Template-Hierarchy Override
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002, 004, 005]
retry_count: 0
---

# Task 006 — Front-End Template-Hierarchy Override

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002, 004, 005
> **Retry count:** 0

## Description

Hook the WordPress template hierarchy so NivoraX templates render on the live site: for a
matching request, compose the resolved header + content template (or 404/search/archive) +
footer and render them via the Phase 10 renderer + cached CSS.

## Context

This is what makes the theme builder real — templates stop being drafts and become the site's
actual output. The assignment resolver (004) picks templates; this task renders the
composition. It must coexist cleanly with themes/plugins and the page-level render switch
(Phase 02/10).

## Requirements (Test Description)

- **Test:** Given a request, the resolved header/content/footer templates render in place of
  the theme's output.
- **Test:** Given a single, the content slot renders the post; given an archive, the loop runs.
- **Test:** Given 404/search requests, the matching templates render.
- **Test:** Given no matching NivoraX template, rendering falls back to the theme (no breakage).
- **Test:** Generated CSS for templates (+ parts + content) is enqueued; output is escaped/safe.

## Acceptance Criteria

- [ ] `template_include` (and friends) override composing header + content + footer.
- [ ] Single/archive/404/search rendering via the resolver (004) + Phase 10 renderer.
- [ ] Graceful theme fallback when no NivoraX template matches.
- [ ] Template/part CSS enqueued; output escaped.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Templates/TemplateHierarchy.php` — hierarchy hook + composition + render.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Coexist with the Phase 02/10 page render switch — a page can have its own NivoraX content
  inside a NivoraX single template's content slot; define the composition order.
- Test against the default theme and one popular theme; allow a per-request opt-out hook.
