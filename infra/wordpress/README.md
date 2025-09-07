# WordPress + WooCommerce Test Environment

Environment for running a real WordPress + WooCommerce instance with both Simple JWT Login and the custom Store SDK JWT mu‑plugin enabled. Suitable for development and can be adapted for production with the hardening steps outlined below.

## Features

- WordPress (latest official image) + MariaDB 11
- Automatic install & idempotent setup via `wpcli` one-shot container
- WooCommerce + Simple JWT Login auto-installed & activated
- JWT secret injected as constant `SIMPLE_JWT_LOGIN_SECRET_KEY`
- Optional test customer user
- Basic WooCommerce store settings applied
- Pretty permalinks enabled
- Automatic sample catalog seeding (10 categories x 10 products each, simple & variable mix, tags & brands taxonomy) on first run

## Quick Start (with npm scripts)

From repo root (shows full setup progress in foreground):

```powershell
npm run wp:env:up
```

What it does:

- Creates `infra/wordpress/.env` from example if missing
- Starts containers in detached mode
- Runs one-shot setup (core install, plugins, config)

Then visit: http://localhost:8080

Edit the generated `.env` to customize (shutdown then `npm run wp:env:up` again to apply changes that require rebuild).

Re-running `npm run wp:env:up` is safe; setup is idempotent.

Detached mode (original background behavior):

```powershell
npm run wp:env:up:detached
```

### Sample Data

On first run the environment seeds:

- 10 product categories (Category 1..10)
- 15 tags (Tag 1..15)
- 5 brands (custom taxonomy `product_brand`)
- 100 products (each category: 7 simple + 3 variable with size variations)

Guard option: `store_sdk_seeded` (WordPress option). To reseed:

```powershell
npm run wp:cli -- option delete store_sdk_seeded
npm run wp:env:down
npm run wp:env:up
```

If you want to skip seeding entirely, create the guard manually before first run:

```powershell
npm run wp:cli -- option add store_sdk_seeded 1
```

## Obtaining a JWT (Simple JWT Login)

Endpoint pattern (GET or POST):

```
GET /wp-json/simple-jwt-login/v1/auth?email=<EMAIL>&password=<PASSWORD>
```

Example (PowerShell):

```powershell
curl "http://localhost:8080/wp-json/simple-jwt-login/v1/auth?email=$($env:TEST_CUSTOMER_EMAIL)&password=$($env:TEST_CUSTOMER_PASSWORD)"
```

Response contains a token you can use in `Authorization: Bearer <token>` for authenticated Store API calls.

## Store SDK JWT mu-plugin (Custom Auth Layer)

In addition to the Simple JWT Login plugin, this environment ships with a purpose-built **must‑use plugin**: `store-sdk-jwt-auth`.

It provides lightweight JWT issuance, one-time autologin tokens, refresh token rotation, and forced authentication via `Authorization: Bearer` without depending on external plugins. Configure the constants below and apply recommended hardening for production use.

### REST Endpoints

| Endpoint                                           | Method(s) | Purpose                                                                  |
| -------------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `/wp-json/store-sdk-auth/v1/token`                 | POST      | Issue access + refresh token (login/email + password).                   |
| `/wp-json/store-sdk-auth/v1/one-time-token`        | POST      | Issue single-use autologin token (requires existing auth).               |
| `/wp-json/store-sdk-auth/v1/autologin`             | POST/GET  | Consume one-time token; establishes WP auth cookies (optional redirect). |
| `/wp-json/store-sdk-auth/v1/refresh`               | POST      | Rotate refresh token and obtain new access + refresh tokens.             |
| `/wp-json/store-sdk-auth/v1/validate`              | GET       | Validate an access token (returns payload).                              |
| Front-channel (`/?storesdk_autologin=1&token=...`) | GET       | Browser deep link autologin (optional redirect).                         |

### Request Parameters (Summary)

| Name            | Used In                     | Notes                                         |
| --------------- | --------------------------- | --------------------------------------------- |
| `login`         | `/token`                    | Username OR email.                            |
| `password`      | `/token`                    | Plain password.                               |
| `refresh_ttl`   | `/token`                    | Optional seconds for refresh token (clamped). |
| `ttl`           | `/one-time-token`           | One-time token TTL (clamped).                 |
| `token`         | `/autologin`, front-channel | One-time token JWT.                           |
| `redirect`      | `/autologin`, front-channel | Relative or same-host absolute URL.           |
| `refresh_token` | `/refresh`                  | Refresh token string.                         |

### Configurable Constants (define in `wp-config.php` before WordPress loads)

| Constant                                      | Default                | Description                                                          |
| --------------------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `STORESDK_JWT_SECRET`                         | (no default, REQUIRED) | HMAC signing secret (HS256). Must be explicitly defined.             |
| `STORESDK_JWT_ACCESS_TTL`                     | `3600`                 | Base access token lifetime (seconds). Filter can still override.     |
| `STORESDK_JWT_ENABLED`                        | `true`                 | Master enable flag. If `false`, plugin is inert (no routes).         |
| `STORESDK_JWT_REFRESH_DEFAULT_TTL`            | `1209600` (14d)        | Default refresh token lifetime.                                      |
| `STORESDK_JWT_REFRESH_MIN_TTL`                | `86400` (1d)           | Minimum allowed `refresh_ttl`.                                       |
| `STORESDK_JWT_REFRESH_MAX_TTL`                | `2592000` (30d)        | Maximum allowed `refresh_ttl`.                                       |
| `STORESDK_JWT_ONE_TIME_DEFAULT_TTL`           | `300` (5m)             | Default one-time token TTL.                                          |
| `STORESDK_JWT_ONE_TIME_MIN_TTL`               | `30`                   | Minimum one-time TTL.                                                |
| `STORESDK_JWT_ONE_TIME_MAX_TTL`               | `900` (15m)            | Maximum one-time TTL.                                                |
| `STORESDK_JWT_REFRESH_MAX_TOKENS`             | `10`                   | Max stored refresh tokens per user (oldest pruned). `0` = unlimited. |
| `STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN` | `true`                 | Enforce one-time token for `/autologin` & front-channel.             |
| `STORESDK_JWT_ENABLE_FRONT_CHANNEL`           | `true`                 | Enable front-channel `?storesdk_autologin=1` flow.                   |

### Filter Hooks

| Filter                          | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `storesdk_jwt_token_expiration` | Override access token TTL (return int seconds). |

### Example `wp-config.php` Snippet

```php
// --- Store SDK JWT Auth overrides ---
define('STORESDK_JWT_SECRET', 'prod_super_secret_at_least_32_chars');
define('STORESDK_JWT_ENABLED', true);
define('STORESDK_JWT_ACCESS_TTL', 3600); // 1h
define('STORESDK_JWT_REFRESH_DEFAULT_TTL', 60 * 60 * 24 * 7); // 7 days
define('STORESDK_JWT_REFRESH_MAX_TOKENS', 5); // Keep last 5 refresh tokens
define('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN', true); // Enforce hardened autologin
// Disable front-channel autologin in certain environments
define('STORESDK_JWT_ENABLE_FRONT_CHANNEL', false);
```

### Security & Hardening

- Always set a strong `STORESDK_JWT_SECRET` (rotate if leaked/after staging refreshes).
- Restrict refresh token lifetime (`STORESDK_JWT_REFRESH_DEFAULT_TTL`) to business needs; prune aggressively via `STORESDK_JWT_REFRESH_MAX_TOKENS`.
- Disable front-channel autologin (`STORESDK_JWT_ENABLE_FRONT_CHANNEL=false`) unless a controlled deep-link scenario is required.
- Consider adding IP / User-Agent binding in a fork for higher assurance (e.g., store alongside refresh token metadata and validate on consume).
- Implement rate limiting (at reverse proxy or WAF) for `/token` and `/refresh` endpoints to mitigate brute force and token stuffing.
- Log anomalous events (multiple failed refresh consumes, signature failures) to your SIEM.
- Enforce HTTPS everywhere; never allow tokens over plain HTTP in production.
- Shorten access token TTL (`STORESDK_JWT_ACCESS_TTL`) while relying on refresh rotation for session continuity.
- Consider adding a revocation list (e.g., transient storing revoked JTI or user version) if you need immediate logout semantics.

### When To Use This vs Simple JWT Login

| Scenario                                                       | Recommended Approach                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| Local integration tests needing one-time / refresh / autologin | Store SDK mu-plugin (default config)                             |
| Production minimal dependency JWT with custom flows            | Store SDK mu-plugin (hardened config + external rate limiting)   |
| Need admin UI for revocation / blacklisting                    | Combine mu-plugin with an additional management plugin or extend |

Select based on operational requirements; both options can coexist if endpoints are namespaced distinctly (already the case here).

## Helper Scripts

Run from repo root:

| Script                    | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `npm run wp:env:up`       | Create env (if needed) + start stack                      |
| `npm run wp:env:down`     | Stop containers (preserve data)                           |
| `npm run wp:env:clean`    | Stop & remove volumes (fresh start)                       |
| `npm run wp:env:logs`     | Tail WordPress logs                                       |
| `npm run wp:cli -- <cmd>` | Run WP-CLI command (e.g. `npm run wp:cli -- plugin list`) |

Examples:

```powershell
npm run wp:cli -- plugin list
npm run wp:cli -- user list
npm run wp:env:logs
npm run wp:env:clean
```

## Integration Testing Ideas

- Spin up stack in CI (GitHub Actions) before running integration tests for SDK.
- Wait for health by polling `http://localhost:8080/wp-json`.
- Programmatically create products via WooCommerce REST (or WP-CLI) for test fixtures.

## CI Example Snippet

```yaml
services:
  wp-env:
    image: docker/compose:latest
```

_(Add your own workflow step invoking `docker compose up -d` then run tests.)_

## Notes

- Data persisted in named volumes `db_data`, `wp_data`.
- To change port edit `docker-compose.yml` mapping `8080:80`.
- `wp-setup.sh` adds secret to `wp-config.php` if missing; updating secret later requires manual edit + restart.

## Troubleshooting

| Issue                    | Fix                                                                              |
| ------------------------ | -------------------------------------------------------------------------------- |
| Setup script exits early | Ensure DB healthy; run `npm run wp:env:clean` and retry                          |
| JWT auth fails           | Confirm secret constant present & matches `.env`; recreate with clean if changed |
| Permalinks 404           | Run: `npm run wp:cli -- rewrite flush --hard`                                    |

---

Review and apply the hardening section before using this stack in production.
