---
task: <NNN>
phase: <NN>
title: <Task Title>
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [] # e.g. [001, 002]
retry_count: 0
---

# Task <NNN> — <Task Title>

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** none <!-- e.g. 001, 002 -->
> **Retry count:** 0

## Description

<One or two sentences: what this task delivers.>

## Context

<Why this task exists. Background, links to related tasks/decisions, and anything an
implementer needs to know before starting. Assume the reader has not read the other
task files.>

## Requirements (Test Description)

<The behavior to implement, framed as what the tests must prove. Describe each test
in plain language so it can be written before the code (TDD-friendly).>

- **Test:** <given … when … then …>
- **Test:** <…>

## Acceptance Criteria

- [ ] <Concrete, checkable condition.>
- [ ] <Prefer conditions verifiable by a command, test, or build.>

## Files to Create

- `<path>` — <purpose>

## Implementation Notes

<!-- Shared scratch space for Michael and the agent: decisions, gotchas, suggestions,
open questions. Append, don't overwrite — keep the running history. -->

-
