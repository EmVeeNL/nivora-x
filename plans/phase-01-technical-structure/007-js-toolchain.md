---
task: 007
phase: 01
title: JS/TS Toolchain (pnpm, Vite, TypeScript, ESLint, Prettier)
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 007 — JS/TS Toolchain (pnpm, Vite, TypeScript, ESLint, Prettier)

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Establish the JavaScript/TypeScript toolchain: pnpm workspace, Vite + React + TypeScript
build, ESLint, and Prettier — with a placeholder editor entrypoint that builds, type-
checks, lints, and formats clean.

## Context

This is the foundation for the React editor app. We use pnpm (per `AGENTS.md`), Vite for
bundling, and strict TypeScript. The JS app lives under `app/`, separate from PHP `src/`,
so the two toolchains don't collide. The actual WordPress enqueue/HMR wiring is task 008;
here we only need a buildable placeholder entry. **Tailwind v4 / ShadCN / dnd-kit /
Tiptap / Framer Motion are deferred** to the editor-app phase — this task sets up only
the build, type, lint, and format infrastructure they'll later plug into.

## Requirements (Test Description)

- **Test:** Given a clean checkout, `pnpm install` resolves with a committed lockfile.
- **Test:** Given the placeholder entry, `pnpm build` (Vite) produces output without
  errors.
- **Test:** Given the config, `pnpm typecheck` (`tsc --noEmit`) passes under strict
  TypeScript (incl. `noUncheckedIndexedAccess`).
- **Test:** Given the config, `pnpm lint` (ESLint) passes, and a deliberate lint
  violation makes it fail.
- **Test:** Given the config, `pnpm format:check` (Prettier) passes, and `pnpm format`
  rewrites a mis-formatted file.

## Acceptance Criteria

- [ ] `package.json` with pnpm, `engines` matching `.nvmrc`, and scripts: `dev`,
      `build`, `typecheck`, `lint`, `lint:fix`, `format`, `format:check`.
- [ ] `pnpm-lock.yaml` committed.
- [ ] `vite.config.ts` builds a React + TS entry from `app/`.
- [ ] `tsconfig.json` with strict mode + `noUncheckedIndexedAccess`.
- [ ] ESLint flat config for TS + React (+ hooks rules) and a Prettier config that don't
      conflict.
- [ ] Placeholder `app/main.tsx` (mounts nothing meaningful yet) that satisfies all gates.

## Files to Create

- `package.json` — deps + scripts (+ `engines`).
- `vite.config.ts` — React/TS build (manifest/HMR refined in task 008).
- `tsconfig.json` (+ `tsconfig.node.json` if needed) — strict TS config.
- `eslint.config.js` — flat ESLint config (TS + React + hooks).
- `.prettierrc` / `.prettierignore` — formatting config.
- `app/main.tsx` — placeholder entrypoint.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Enforce the strict-TS prop-casting pattern project-wide: with `noUncheckedIndexedAccess`,
  index access yields `T | undefined` — handle via `(value as T | undefined) ?? default`.
- Keep ESLint and Prettier non-overlapping (use `eslint-config-prettier`) so formatting
  isn't double-owned.
- Script names here are called by hooks (010) and CI (011) — keep them stable.
- Note in code/README that Tailwind/ShadCN/etc. land in the editor-app phase, not here.
