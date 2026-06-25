# AGENTS.md — NivoraX

> Persistent project memory for AI agents and contributors. Keep this file current.
> If a fact here conflicts with the code, fix one of them and note it.

## What NivoraX Is

NivoraX is a **WordPress plugin** that is **both a content editor and a
theme/layout builder**. It edits pages, and it builds reusable templates
(headers, footers, loops) and global design tokens. Think Elementor/Bricks class
builder, built from scratch on a custom node-tree engine (not the block editor).

The editor is a three-panel app: **layer tree · canvas · inspector**. The source of
truth is a JSON **node tree** (type, props, children, responsive overrides). The
same tree is rendered two ways:

- in the **editor** via React, and
- on the **front end** via PHP.

These two renderers must stay in agreement — that parity is the project's central
architectural challenge.

## Status

- **Planning:** Phases 01–14 **Defined** with full task files (107 tasks); 15–21 **Staged**
  (provisional titles). See `plans/ROADMAP.md`.
- **Build:** Phases 01–07 are implemented and marked Done. Phase 08 (Inspector &
  Settings) is next.
- **Current editor shell:** left rail has Navigator and Elements panels. Elements groups are
  collapsible with only the first visible group open by default; Navigator supports live
  tree selection, collapse state, visibility/lock, rename, duplicate/delete, and tree
  reorder via the shared DnD/store pipeline.

## Key Architecture Decisions

- **Augment existing post types (not a custom CPT).** Like Elementor, NivoraX is enabled
  on native Pages / Posts / public CPTs via a Settings toggle, so users edit existing pages.
- **Layout stored as JSON in post meta** — `_nivorax_data`, a versioned envelope;
  `post_content` stays the source of truth for Gutenberg.
- **Coexist with Gutenberg via a per-page mode flag** — `_nivorax_edit_mode`
  (`nivorax` | `default`). One editor active at a time; switching preserves both sides
  with **no conversion and no live sync**. The mode flag decides what the front end renders.
- **Editor-first build order.** The editor batch (Phases 04–09) renders the canvas in
  React only; the **PHP renderer + CSS generation** (front-end output) is deferred to
  **Phase 10**, where React↔PHP render parity is tackled.
- **Responsive values** are modeled per styleable prop as `{ base, <breakpoint>: value }`;
  the breakpoint set is finalized in Phase 09.
- **Design tokens, full styling controls, theme-builder, dynamic content, forms,
  marketplace** are later phases (11–21), driven by reference screenshots in `images/`.

## Tech Stack

### Frontend (editor app)

- React + TypeScript
- TailwindCSS v4 — **editor chrome only**, never for user/canvas content (users set
  arbitrary values; canvas styling is generated CSS / inline styles)
- ShadCN — inspector controls and primitives
- Framer Motion — editor polish only, kept out of the canvas render path
- Iconify (Tabler icons)
- Drag & drop: **dnd-kit** (chosen over SortableJS — plays well with React for nested
  containers + the layer tree)
- WYSIWYG fields: **Tiptap**
- Build: Vite (with a WP enqueue/manifest integration)

### Backend (plugin)

- PHP 8.x, WordPress plugin
- Composer (PSR-4 autoload, dev tooling)
- WP-CLI for setup/automation
- Renderer mirrors the React node tree on the front end (`ElementRendererInterface`)

### Infrastructure (local dev)

- Docker: WordPress + Apache, MariaDB, Mailhog
  - Custom Dockerfile `FROM wordpress:7.0.0-php8.5-apache`, adding **Xdebug** + **WP-CLI**
    (https://hub.docker.com/_/wordpress?tag=7.0.0-php8.5-apache)

### Quality / Tooling

- JS package manager: **pnpm**
- Tests: Pest/PHPUnit (PHP), Vitest (unit JS), Playwright (E2E)
- PHP: Composer, PHPCS (WordPress standard), PHPStan
- JS/TS: ESLint, Prettier
- Commit enforcement: husky + lint-staged + commitlint
- CI: GitHub Actions (build + lint + test on push/PR), plus husky local hooks
- Shared config: `.editorconfig`, `.nvmrc`

## Conventions

- **Git:** Gitflow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).
  See https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- **Commits:** Conventional Commits (`type(scope): subject`).
- **Coding standards:** PHPCS (WordPress), ESLint + Prettier. CI/hooks enforce them.
- **TDD-friendly:** tasks describe their tests first (see task template).

## Planning System

Work is organized into **phases**, each a folder under `plans/`.

```
plans/
  _templates/
    phase-index.template.md   # copy → <phase>/index.md
    task.template.md          # copy → <phase>/<NNN>-<slug>.md
  phase-01-technical-structure/
    index.md                  # phase overview (objective, scope, task table, risks)
    001-<slug>.md             # one file per task
    002-<slug>.md
```

- **Phase folder:** `phase-<NN>-<kebab-slug>`
- **Task file:** `<NNN>-<kebab-slug>.md` (3-digit, zero-padded)
- **Phase index file:** `index.md`

### Status vocabulary (phases and tasks)

`Not Started` · `In Progress` · `Blocked` · `In Review` · `Done`

Keep a task's status in both its frontmatter and the phase index table in sync.

### Definition vocabulary (phases)

`Staged` (provisional placeholder) · `Draft` (under review) · `Defined` (locked).
Phases are defined collaboratively, ~one batch ahead; task files are written only for
**Defined** phases. `plans/ROADMAP.md` is the manifest of all phases.

## Common Commands

- **Setup:** `./bin/setup.sh` (idempotent; `--fresh` to wipe + re-provision)
- **Up / down:** `docker compose up -d` / `docker compose down`
- **Dev server (HMR):** `pnpm dev` (set `NIVORAX_VITE_DEV=true` in wp-config / .env)
- **Production build:** `pnpm build`
- **JS tests (unit):** `pnpm test:unit` | watch: `pnpm test:unit:watch`
- **E2E tests:** `pnpm test:e2e` (stack must be up + provisioned)
- **PHP tests:** `cd plugin && composer test`
- **PHP coverage:** `XDEBUG_MODE=coverage composer test:coverage` (inside container)
- **JS lint:** `pnpm lint` / `pnpm lint:fix`
- **PHP lint:** `cd plugin && composer lint` / `composer lint:fix`
- **JS typecheck:** `pnpm typecheck`
- **PHP static analysis:** `cd plugin && composer analyse`
- **Full PHP gate:** `cd plugin && composer qa` (lint + analyse + test)

## Open Decisions

_(none currently — Phase 01 foundation decisions resolved 2026-06-24)_
