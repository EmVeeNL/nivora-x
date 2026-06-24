# Contributing to NivoraX

## Gitflow branch model

| Branch | Purpose |
|--------|---------|
| `main` | Released code only — never commit directly |
| `develop` | Integration branch for finished features |
| `feature/<slug>` | New features, branched from `develop` |
| `release/<v>` | Release preparation, branched from `develop` |
| `hotfix/<slug>` | Urgent production fixes, branched from `main` |

```
main ──────────────────────────────────────► (released tags)
  └── develop ──────────────────────────────► (integration)
        └── feature/foo ──► merge PR into develop
```

**Never push directly to `main` or `develop`.** Open a PR; CI must be green.

## Conventional Commits

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Allowed types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration |
| `chore` | Tooling, config, maintenance |
| `revert` | Revert a previous commit |

### Scope (optional, kebab-case)

Use a short kebab-case noun: `editor`, `plugin`, `infra`, `canvas`, `inspector`, `docs`, etc.

### Examples

```
feat(editor): add canvas iframe with selection overlay
fix(plugin): guard missing vendor/autoload.php with admin notice
test(canvas): add unit tests for ResizeHandles component
ci: add Playwright E2E job to CI workflow
```

commitlint enforces the rules above automatically on every commit via the `commit-msg` hook.
A bad message is rejected before it's recorded — fix the message and try again.

## Git hooks

Hooks are installed automatically when you run `pnpm install` (via `husky`).

| Hook | What it does |
|------|-------------|
| `pre-commit` | Runs `lint-staged` — formats/lints only staged files |
| `commit-msg` | Runs `commitlint` — enforces Conventional Commits |
| `pre-push` | Runs `tsc --noEmit` — catches type errors before push |

**Emergency bypass** (use sparingly): `git commit --no-verify`

## Pull requests

1. Branch from `develop`: `git checkout -b feature/<slug> develop`
2. Commit with Conventional Commit messages.
3. Push and open a PR targeting `develop`.
4. CI (GitHub Actions) must be green: PHP QA + JS lint/typecheck/build/tests + E2E.
5. Squash-merge or rebase — keep `develop` history clean.

## Code standards

- **PHP:** WordPress Coding Standards (PHPCS). Run `composer lint:fix` before committing.
- **JS/TS:** ESLint + Prettier. Run `pnpm lint:fix && pnpm format` before committing.
- **TypeScript:** strict mode + `noUncheckedIndexedAccess`. Index access must be cast:
  `(node.props.foo as T | undefined) ?? defaultValue`.
