---
task: 002
phase: 01
title: Docker Environment
status: Not Started # Not Started | In Progress | Blocked | In Review | Done
depends_on: [001]
retry_count: 0
---

# Task 002 — Docker Environment

> **Status:** Not Started <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 001
> **Retry count:** 0

## Description

Provide a one-command local stack: a custom WordPress/Apache image (with Xdebug and
WP-CLI added) plus MariaDB and Mailhog, wired together with Docker Compose and a
`.env`-driven configuration.

## Context

Every later task — provisioning, PHP tooling, tests, CI E2E — runs against this stack.
The base image is `wordpress:7.0.0-php8.5-apache`; we extend it via a custom Dockerfile
because the official image ships neither Xdebug nor WP-CLI. Mailhog captures all
outbound mail for inspection (SMTP wiring happens in task 003). Xdebug must be present
but **off by default** (toggle via env) so normal requests stay fast. The plugin source
is bind-mounted into the container so edits are live.

## Requirements (Test Description)

- **Test:** Given the repo, `docker compose config` validates with no errors and
  resolves all `.env` variables.
- **Test:** Given `docker compose up -d`, the `wordpress`, `db` (MariaDB), and
  `mailhog` services reach a running/healthy state.
- **Test:** Given the stack is up, an HTTP request to the documented WordPress URL
  returns a WordPress response (install screen is acceptable pre-task-003).
- **Test:** Given the stack is up, the Mailhog web UI is reachable on its documented
  port.
- **Test:** Inside the `wordpress` container, `wp --info` succeeds and `php -m` lists
  `xdebug`; with the Xdebug env toggle off, `xdebug.mode=off`.
- **Test:** The plugin directory on the host is bind-mounted at the WordPress plugins
  path inside the container (a file created on the host appears in the container).

## Acceptance Criteria

- [ ] Custom Dockerfile `FROM wordpress:7.0.0-php8.5-apache` installs Xdebug and WP-CLI.
- [ ] `docker-compose.yml` defines `wordpress`, `db` (MariaDB), `mailhog` with networks
      and named volumes for DB data and WP core/uploads.
- [ ] `.env.example` documents all required vars (DB creds, WP URL/port, Mailhog ports,
      Xdebug toggle); `.env` is gitignored.
- [ ] Plugin source bind-mounted into `wp-content/plugins/nivorax`.
- [ ] Xdebug installed but disabled unless the env toggle enables it.
- [ ] WordPress reachable on the documented host port; Mailhog UI reachable.
- [ ] WP-CLI usable inside the container (`wp --info`).

## Files to Create

- `docker/wordpress/Dockerfile` — extends the official image with Xdebug + WP-CLI.
- `docker/wordpress/php/xdebug.ini` — env-gated Xdebug config.
- `docker/wordpress/php/uploads.ini` — upload size / memory tweaks for dev.
- `docker-compose.yml` — wordpress + db + mailhog services.
- `.env.example` — documented environment variables.

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Consider a `docker compose` healthcheck on `db` so `wordpress` waits for MariaDB.
- Watch host UID/GID vs the Apache `www-data` user for the bind-mounted plugin dir —
  document any `chown`/permission step to avoid write-permission surprises.
- WP-CLI in the official image: install the phar, or copy from `wordpress:cli`. Either
  works; pick one and document it.
- Pin the MariaDB image tag explicitly (don't use `latest`).
