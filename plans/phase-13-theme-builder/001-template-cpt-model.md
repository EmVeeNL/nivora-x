---
task: 001
phase: 13
title: Template CPT, Type & Conditions Model
status: In Review # Not Started | In Progress | Blocked | In Review | Done
depends_on: []
retry_count: 0
---

# Task 001 — Template CPT, Type & Conditions Model

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none
> **Retry count:** 0

## Description

Register the `nivorax_template` custom post type and its metadata — template **type**
(header/footer/single/archive/404/search) and **conditions** — built on the Phase 04 document
model.

## Context

Templates are documents with extra metadata, stored separately from page content (which
augments native posts). This CPT is the home for all theme-builder templates, mirroring
Elementor's library. It anchors editing (task 002), assignment (004), and front-end rendering
(006).

## Requirements (Test Description)

- **Test:** Given the CPT, `nivorax_template` registers with the right capabilities + admin
  visibility.
- **Test:** Given a template, it stores a type and a conditions payload alongside the Phase 04
  document envelope.
- **Test:** Given the model, type is constrained to the supported set; conditions validate.
- **Test:** Templates persist + reload through the Phase 04 storage contract.
- **Test:** CPT + model pass PHPCS + PHPStan.

## Acceptance Criteria

- [ ] `nivorax_template` CPT registered (capabilities, admin visibility).
- [ ] Type metadata (header/footer/single/archive/404/search) + conditions metadata.
- [ ] Reuses the Phase 04 document envelope for content.
- [ ] Validation for type + conditions.
- [ ] Pest tests; PHPCS + PHPStan clean.

## Files to Create

- `src/Templates/TemplatePostType.php` — CPT registration.
- `src/Templates/TemplateModel.php` — type + conditions metadata + accessors.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Reuse the Phase 02 capability + storage patterns; templates are documents + metadata.
- Keep conditions a structured payload (rules array) the resolver (task 004) consumes.
