# GitHub Copilot / AI Agent Instructions

Concise, project-specific rules to make productive, low‑risk changes to this monorepo.

## ✅ Do / ❌ Don't

**Do**

- Keep commits minimal & purpose-driven, using conventional commit messages for package changes (release automation relies on them).
- Respect existing lint + formatting (ESLint + Prettier). Run `nx lint <project>` before suggesting changes.
- Export new public APIs only via each package's `src/index.ts`.
- Reuse existing patterns (services, events, interceptors, plugins); extend instead of inventing abstractions.

**Don't**

- Modify root `package.json`, `nx.json`, any `CHANGELOG*`, or `renovate.json` unless explicitly requested.
- Introduce CommonJS wrappers; repo is pure ESM (`"type": "module"`).
- Add broad / unnecessary dependencies (prefer `axios`, `qs`, `date-fns`, or stdlib first).

## 📁 Repository Layout

Managed by Nx.

- `packages/core` – Core WooCommerce Store SDK (primary architectural reference)
- Other packages: `simple-jwt-login`, `jwt-authentication-for-wp-rest-api`, `hippoo` (auth / plugin helpers; single entry export)
- `apps/` – Example Angular + Node app (manual testing only; not published)

## 🏗 Core Architecture (`packages/core`)

Entry: `src/index.ts` re-exports only stable surface.

- `Sdk` (`lib/sdk.ts`) – creates axios client (`createHttpClient`), installs interceptors, initializes plugins, prefetches cart, wires events
- `StoreService` (`lib/services/store.service.ts`) – aggregates domain services (`cart`, `products`, `orders`, etc.) via getters; each file `<entity>.service.ts` with ctor `(state, config, events)`
- Events – lightweight `EventBus` (`lib/bus/event.bus.ts`) with middleware, `once`, `waitFor`, scoped events; extend `sdk.events.ts`
- HTTP – `createHttpClient` sets idempotent axios instance; `httpClient` proxy throws until init
- Interceptors – nonce & cart token update + emit (`nonce:changed`, `cart:token:changed`)
- Plugins – implement `StoreSdkPlugin`; special handling only where needed (`simple-jwt-login` login flow)
- State – `StoreSdkState` holds only mutable runtime data (no derived values)

## ➕ Adding a New Service

1. Create `packages/core/src/lib/services/store/<name>.service.ts` exporting `<PascalName>Service`.
2. Constructor: `(state: StoreSdkState, config: StoreSdkConfig, events: EventBus<StoreSdkEvent>)`.
3. Add private field + getter in `StoreService` (keep alphabetical order).
4. Re-export any public types/functions via `src/index.ts` only.

## 🔔 Extending Events

1. Add key in `sdk.events.ts` (use optional payload only when truly optional).
2. Emit with `events.emit('your:event', payload)`; consumers use `on` / `waitFor`.
3. Follow naming: `domain:action[:phase]` (e.g. `auth:token:refresh:start`).

## 🔌 Plugins

Follow existing `id` patterns. Any special-case in `Sdk.init` must be:

- Guarded by exact `plugin.id`
- Minimal (delegate heavy logic into the plugin)
- Free of cross-plugin branching

## 🔐 Tokens & Auth Flow

- Nonce + cart token updated transparently via interceptors (config may expose `getToken/setToken/clearToken`).
- On `auth:changed` false: core clears tokens if `clearToken` hooks exist.
- `simple-jwt-login` may `fetchCartOnLogin` (refetches post-auth).

## 🧪 Testing (Library Focus)

- Vitest (`tsconfig.spec.json`). Place tests alongside sources (`src/lib/**`) or in `tests/`; name them `*.spec.ts`.
- New events/interceptors: add/update unit tests; mock HTTP (`doGet/doPost/...`). No network calls.
- Service changes (signatures, emitted events, URL/query, headers) MUST update matching `*.service.spec.ts` in the same commit.
- Run tests per library: `nx test <library>` (e.g. `nx test core`).

## 🛠 Build & Dev Workflows

- Build all libraries: `npx nx run-many -t build` (or `npm run dev:rebuild` to reset cache + rebuild).
- Build single library: `nx build <library>` (e.g. `nx build core`).
- Serve Angular example: `npm run serve:angular`.
<!-- Removed Node example application (@store-sdk/example-node) -->
- Releases: automated via Nx + conventional commits (never hand-edit CHANGELOGs).

## 🧹 Linting

- Lint single library: `nx lint <library>` (e.g. `nx lint core`) before committing service or API changes.

## ✨ Style & Types

- Strict TS (`tsconfig.base.json`) – no `any`; prefer precise generics / utility types.
- Export only what’s needed; avoid circular deps (especially with `index.ts`).
- Use relative internal imports (`./lib/...`).

## ✅ Safe Change Checklist (Before Proposing)

- New service/event wired through `StoreService` / `sdk.events.ts`.
- `Sdk.init` stays idempotent.
- No root config / pipeline files touched unless requested.
- Tests updated/added for new or changed public behavior.

## 🔗 Quick References

- Orchestrator: `packages/core/src/lib/sdk.ts`
- Event bus: `packages/core/src/lib/bus/event.bus.ts`
- Interceptors: `packages/core/src/lib/interceptors/*.interceptor.ts`
- Public API barrel: `packages/core/src/index.ts`

> Revise this file when architecture or patterns materially change; keep concise and actionable.
