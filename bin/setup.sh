#!/usr/bin/env bash
# bin/setup.sh — idempotent WordPress provisioning via WP-CLI
#
# Usage:
#   ./bin/setup.sh           # provision (safe to re-run)
#   ./bin/setup.sh --fresh   # wipe volumes and re-provision from scratch
#
# Variables are read from .env in the repo root. Copy .env.example → .env first.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Load .env ────────────────────────────────────────────────────────────────
ENV_FILE="${REPO_ROOT}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: .env not found. Copy .env.example → .env and fill in values." >&2
  exit 1
fi
# shellcheck disable=SC1090
set -a; source "${ENV_FILE}"; set +a

# ── Defaults ─────────────────────────────────────────────────────────────────
WP_PORT="${WP_PORT:-8080}"
WP_URL="${WP_URL:-http://localhost:${WP_PORT}}"
WP_TITLE="${WP_TITLE:-NivoraX Dev}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-admin@nivorax.local}"

# ── Helpers ───────────────────────────────────────────────────────────────────
wp() {
  docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T wordpress \
    wp --allow-root "$@"
}

wait_for_wp() {
  echo "⏳  Waiting for WordPress container…"
  local retries=30
  while ! docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T wordpress \
      php -r 'exit(0);' &>/dev/null; do
    retries=$((retries - 1))
    if [[ ${retries} -eq 0 ]]; then
      echo "ERROR: WordPress container did not become ready." >&2
      exit 1
    fi
    sleep 2
  done
}

# ── --fresh: wipe and restart ─────────────────────────────────────────────────
if [[ "${1:-}" == "--fresh" ]]; then
  echo "🔥  --fresh: stopping containers and removing volumes…"
  docker compose -f "${REPO_ROOT}/docker-compose.yml" down -v
fi

# ── Ensure stack is running ───────────────────────────────────────────────────
echo "🐳  Starting Docker stack…"
docker compose -f "${REPO_ROOT}/docker-compose.yml" up -d --build
wait_for_wp

# ── WordPress core install (idempotent) ───────────────────────────────────────
if wp core is-installed 2>/dev/null; then
  echo "✅  WordPress already installed — skipping core install."
else
  echo "📦  Installing WordPress core…"
  wp core install \
    --url="${WP_URL}" \
    --title="${WP_TITLE}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
fi

# ── Options ───────────────────────────────────────────────────────────────────
echo "⚙️   Configuring options…"
wp option update siteurl  "${WP_URL}"      --quiet
wp option update home     "${WP_URL}"      --quiet
wp option update timezone_string "Europe/Amsterdam" --quiet
wp option update permalink_structure "/%postname%/" --quiet
wp rewrite flush --quiet

# ── Plugins ───────────────────────────────────────────────────────────────────
# Query Monitor
if wp plugin is-installed query-monitor 2>/dev/null; then
  echo "✅  Query Monitor already installed."
else
  echo "🔌  Installing Query Monitor…"
  wp plugin install query-monitor --activate --quiet
fi
wp plugin is-active query-monitor || wp plugin activate query-monitor --quiet

# NivoraX plugin (present from Phase 01 Task 004 onwards)
if wp plugin is-installed nivorax 2>/dev/null; then
  wp plugin is-active nivorax || wp plugin activate nivorax --quiet
  echo "✅  NivoraX plugin active."
else
  echo "ℹ️   NivoraX plugin not yet present (expected until Phase 01 Task 004)."
fi

echo ""
echo "🎉  Setup complete."
echo "    WordPress: ${WP_URL}"
echo "    Admin:     ${WP_URL}/wp-admin  (${WP_ADMIN_USER} / ${WP_ADMIN_PASSWORD})"
echo "    Mailhog:   http://localhost:${MAILHOG_UI_PORT:-8025}"
