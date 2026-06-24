---
phase: 14
slug: dynamic-content-cms
title: Dynamic Content & CMS Mapping
created: 2026-06-24
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
definition: Defined # Staged | Draft (under review) | Defined
---

# Phase 14 — Dynamic Content & CMS Mapping

> **Created:** 2026-06-24
> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Definition:** Defined — approved 2026-06-24.

## Objective

Bind element props to real data and customize queries. A **dynamic-binding** system maps a
node's props (text, image src, link, …) to data **sources** (core post fields, custom
fields/meta, taxonomies & terms, author & site) through a **field-provider abstraction**
(native now; ACF/Meta Box/Pods later), plus a **full query-loop builder** extending the Phase
13 loop. Bindings resolve on the front end (Phase 10 renderer, real context) and **preview**
in the editor (current/sample data).

## Scope

- **Binding model:** a bindable prop holds a static value **or** a binding descriptor
  (source, field, fallback, format).
- **Field-provider abstraction** + native providers: **core post fields**, **custom fields
  (post meta)**, **taxonomies & terms**, **author & site**. A provider **seam** for ACF/Meta
  Box/Pods later.
- **Binding UI** (reference screenshot 07): a "make dynamic" affordance per bindable prop in
  the inspector — choose source + field + fallback + format.
- **Front-end resolution** (PHP) against the request/loop context.
- **Editor preview** of bindings via REST against the current/sample post.
- **Query-loop builder:** extend the Phase 13 loop with post type, taxonomy/meta filters,
  ordering, count, offset, pagination; the loop sets the binding context for its items.

## Out of Scope

- Specific **ACF/Meta Box/Pods integrations** (provider seam only this phase).
- Complex relationship/repeater field types (basic fields first).
- **Component library** (Phase 15), **forms** (Phase 16).

## Success Criteria

- [ ] A node prop can be bound to a dynamic source (core/meta/taxonomy/author/site) with
      fallback + format.
- [ ] Field-provider abstraction with native providers implemented; seam for ACF/etc.
- [ ] Binding UI (make-dynamic) per bindable prop in the inspector.
- [ ] Query-loop builder (type/filters/order/count/offset/pagination) sets context for inner
      bindings.
- [ ] Bindings resolve correctly on the front end and preview in the editor.
- [ ] Tests cover binding resolution, the query builder, preview, and front-end render.

## Task Overview

> Draft breakdown — refined when we write the task files.

| Task | Description | Depends On | Status |
| ---- | ----------- | ---------- | ------ |
| 001  | Binding model (prop = static \| binding: source/field/fallback/format) + schema | — | Not Started |
| 002  | Field-provider abstraction + native providers (core/meta/taxonomy/author+site) | 001 | Not Started |
| 003  | Binding UI in the inspector (make-dynamic per bindable prop) | 001, 002 | Not Started |
| 004  | Front-end binding resolution (PHP, against request/loop context) | 002 | Not Started |
| 005  | Editor binding preview (current/sample data via REST) | 002, 003 | Not Started |
| 006  | Query-loop builder (extend the Phase 13 loop) | 002 | Not Started |
| 007  | Tests + E2E (dynamic single + custom-loop archive) + polish | 004, 005, 006 | Not Started |

## Architectural Notes

- A **bindable prop** holds a static value or a binding descriptor; the renderer resolves
  bindings against the **current context** (post/term/author/site). Inside a query loop, the
  loop item is the context.
- **Field providers** abstract data access (list fields + resolve a field for a context).
  Native providers ship; ACF/Meta Box/Pods are future providers via the seam — keep it minimal.
- **Editor preview** resolves bindings via a REST endpoint against the current/sample post
  (the editor can't run PHP data access). Markup/CSS parity (Phase 10 harness) still covers the
  *structure*; resolved data values are context-dependent and tested separately.
- The **query builder** stores a query spec on the loop element; PHP runs `WP_Query`; inner
  bindings resolve per loop item.
- Bindings are a **value-kind** in the Phase 08 control system, alongside raw + token values.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Binding context correctness across templates/loops/parts | H | M | One clear context-resolution model; test nested loops/parts. |
| Editor preview vs front-end data mismatch | M | M | Preview via the same provider logic over REST; document it as sample/current-context. |
| Unbounded/expensive queries | M | M | Sensible defaults, pagination, limits. |
| Provider seam over-abstraction | L | M | Ship native providers concretely; keep the seam minimal. |
