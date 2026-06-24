---
task: 003
phase: 01
title: WordPress Provisioning via WP-CLI
status: Done # Not Started | In Progress | Blocked | In Review | Done
depends_on: [002]
retry_count: 0
---

# Task 003 — WordPress Provisioning via WP-CLI

> **Status:** Done <!-- Not Started | In Progress | Blocked | In Review | Done -->
> **Depends on:** 002
> **Retry count:** 0

## Description

Provide an idempotent WP-CLI setup script that installs and configures WordPress end to
end: core install, admin user, baseline options, Mailhog SMTP routing, the Query
Monitor helper plugin, and activation of the NivoraX plugin.

## Context

A contributor should go from "containers up" to "working, configured WordPress" with a
single command, and be able to re-run it safely. WordPress sends mail via PHP `mail()`
by default; to capture it in Mailhog we route PHPMailer to `mailhog:1025` (simplest via
a small mu-plugin hooking `phpmailer_init`). Query Monitor is installed for builder
debugging in later phases. The NivoraX plugin skeleton (task 004) is activated here when
present. The script must be idempotent — check-before-create everywhere.

## Requirements (Test Description)

- **Test:** Given fresh containers, running the setup script once results in
  `wp core is-installed` returning success.
- **Test:** Given an already-provisioned site, running the script a second time exits
  successfully and changes nothing destructive (idempotent).
- **Test:** After setup, the configured admin user exists with the documented role.
- **Test:** Sending a test email (`wp eval` / a test trigger) results in the message
  appearing in the Mailhog inbox (proves SMTP routing).
- **Test:** After setup, `wp plugin is-active query-monitor` succeeds.
- **Test:** When the NivoraX plugin is present, after setup `wp plugin is-active
  nivorax` succeeds with no PHP notices.
- **Test:** A documented `--fresh` path resets the DB/volumes and re-provisions cleanly.

## Acceptance Criteria

- [ ] Idempotent setup script (re-runnable, check-before-create) provisions core, admin
      user, site URL/title, permalinks, and timezone.
- [ ] mu-plugin (or equivalent) routes outbound mail to Mailhog (`mailhog:1025`).
- [ ] Query Monitor installed and activated.
- [ ] NivoraX plugin activated when present.
- [ ] A `--fresh` (reset) mode is documented.
- [ ] Script is invokable both inside the container and via a host wrapper command.

## Files to Create

- `bin/setup.sh` — idempotent provisioning entrypoint (runs WP-CLI in the container).
- `docker/wordpress/mu-plugins/mailhog-smtp.php` — routes PHPMailer to Mailhog.
- `bin/lib/wp.sh` — small shared helpers (optional; container exec wrappers).

## Implementation Notes

<!-- Shared scratch space for Michael and the agent. -->

- Pull secrets/admin creds from `.env`, not hardcoded, so they aren't committed.
- The mu-plugins dir must be mounted (coordinate with task 002 volumes).
- Consider a top-level `make setup` / pnpm script wrapper for discoverability; the
  canonical command gets documented in README (task 012).
- Keep provisioning data (admin user/email/site title) overridable via env for CI.
