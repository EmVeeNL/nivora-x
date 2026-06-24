# NivoraX

A custom WordPress page and layout builder plugin — a node-tree editor with a React canvas,
PHP front-end renderer, and design-token system. Think Elementor/Bricks, built from scratch.

## Prerequisites

| Tool | Version |
|------|---------|
| Node | 22+ (see `.nvmrc`) |
| pnpm | 9+ |
| Docker + Docker Compose | latest |
| PHP (host, for Composer) | 8.5+ |
| Composer | 2+ |

## Quickstart

```sh
# 1. Clone
git clone git@github.com:EmVeeNL/nivora-x.git
cd nivora-x

# 2. Configure environment
cp .env.example .env          # edit creds/ports if needed

# 3. Install JS dependencies (also installs git hooks via husky)
pnpm install

# 4. Install PHP dependencies (inside plugin/)
cd plugin && composer install && cd ..

# 5. Build production assets (needed before provisioning)
pnpm build

# 6. Start Docker stack + provision WordPress end-to-end
./bin/setup.sh
```

After setup:

| URL | What |
|-----|------|
| `http://localhost:8080` | WordPress front end |
| `http://localhost:8080/wp-admin` | WP admin (`admin` / `admin`) |
| `http://localhost:8025` | Mailhog — captured outbound mail |

To re-run provisioning safely (idempotent): `./bin/setup.sh`  
For a clean slate: `./bin/setup.sh --fresh`

## Daily commands

### JavaScript (run from repo root)

```sh
pnpm dev             # Vite dev server with HMR (http://localhost:5173)
pnpm build           # Production build → plugin/build/
pnpm typecheck       # tsc --noEmit
pnpm lint            # ESLint
pnpm lint:fix        # ESLint auto-fix
pnpm format          # Prettier write
pnpm format:check    # Prettier check
pnpm test:unit       # Vitest (run once)
pnpm test:unit:watch # Vitest (watch mode)
pnpm test:e2e        # Playwright (needs Docker stack running + provisioned)
```

### PHP (run from `plugin/`)

```sh
composer lint        # PHPCS (WordPress standard)
composer lint:fix    # phpcbf auto-fix
composer analyse     # PHPStan level 6
composer test        # Pest (unit + integration)
composer test:coverage # Pest + Xdebug coverage (set XDEBUG_MODE=coverage in .env first)
composer qa          # lint + analyse + test (full gate)
```

### Docker

```sh
docker compose up -d        # Start stack in background
docker compose down         # Stop stack (keeps volumes)
docker compose down -v      # Stop + wipe volumes
docker compose exec wordpress bash   # Shell into WP container
docker compose exec wordpress wp [cmd] --allow-root  # WP-CLI
```

## Xdebug / coverage

Xdebug is off by default. To enable for a coverage run:

```sh
XDEBUG_MODE=coverage docker compose exec -T wordpress bash -c \
  'cd /var/www/html/wp-content/plugins/nivorax && composer test:coverage'
```

Or set `XDEBUG_MODE=coverage` in `.env` and restart the container.

## Vite dev server (HMR inside WordPress)

1. In `.env` (or `wp-config.php` equivalent), define `NIVORAX_VITE_DEV=true`.
2. Run `pnpm dev` to start the Vite dev server.
3. Open the NivoraX admin page — edits to `app/` hot-reload instantly.

## Architecture at a glance

Work is organized in phases under `plans/`. See `plans/ROADMAP.md` for the full list.
See `AGENTS.md` for architecture decisions and the AI agent entry point.

## Troubleshooting

**Port conflict on 8080/8025:** change `WP_PORT` / `MAILHOG_UI_PORT` in `.env`.  
**`vendor/autoload.php` missing:** run `composer install` inside `plugin/`.  
**`plugin/build/` missing:** run `pnpm build` before provisioning.  
**WP not reachable yet:** give the containers ~20 s after `docker compose up -d`.
