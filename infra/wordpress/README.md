# WordPress + WooCommerce Test Environment

Local disposable environment for integration tests against a real WordPress + WooCommerce instance with Simple JWT Login authentication enabled.

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

This environment is for development & testing only. Do not use in production.
