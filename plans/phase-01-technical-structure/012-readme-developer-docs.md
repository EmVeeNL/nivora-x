---
task: 012
phase: 01
title: README & Developer Docs
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [011]
retry_count: 0
---

# Task 012 — README & Developer Docs

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 011
> **Retry count:** 0

## Description

Finalize the developer documentation: a `README` with a copy-pasteable quickstart and a
daily-commands reference, plus a `CONTRIBUTING` guide covering the Gitflow + Conventional
Commits workflow. Done last, once all real commands exist.

## Description Note

This task closes the phase: every command it documents must already exist and pass.

## Context

By now the stack, provisioning, both toolchains, tests, hooks, and CI are in place, so
the docs can reference real, working commands rather than aspirations. The quickstart is
the phase's headline success criterion: a new contributor follows it verbatim and ends
with a running, provisioned WordPress and green checks. `CONTRIBUTING` codifies the
branch model and commit format that commitlint (010) enforces.

## Requirements (Test Description)

- **Test:** Following the README quickstart verbatim on a clean machine yields a running,
  provisioned WordPress with the plugin active (manual verification, checklist provided).
- **Test:** Every command referenced in the README/CONTRIBUTING exists as a real
  script/target (Composer/pnpm/make/bin) — no dangling commands.
- **Test:** The documented Conventional Commit types exactly match commitlint's allowed
  types (task 010).
- **Test:** Internal links and file references in the docs resolve (no broken links).

## Acceptance Criteria

- [ ] `README.md` covers: overview, prerequisites, quickstart (clone → up → setup →
      verify), daily commands (build/dev, test, lint/format, qa), URLs (WP, Mailhog),
      and a troubleshooting note or two.
- [ ] `CONTRIBUTING.md` covers: Gitflow branch model, Conventional Commit format + types,
      hook behavior, and the PR/CI expectations.
- [ ] All referenced commands exist and succeed.
- [ ] Commit-type list matches commitlint config.
- [ ] `AGENTS.md` "Common Commands" section updated with the finalized commands.

## Files to Create

- `README.md` — full developer README (expands the task-001 skeleton).
- `CONTRIBUTING.md` — workflow + conventions guide.
- (edit) `AGENTS.md` — fill in the "Common Commands" section.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Keep the quickstart to the *minimum* commands — link out to deeper sections for detail.
- Document the Xdebug/coverage env toggle and the dev-server (HMR) workflow explicitly;
  they're the least obvious parts.
- Update `AGENTS.md` here so the project memory and the human docs agree at phase close.
- Consider a short "architecture at a glance" paragraph pointing at `plans/` so new
  contributors find the phase/task system.
