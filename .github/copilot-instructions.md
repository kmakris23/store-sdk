# GitHub Copilot / AI Agent Instructions

Concise, project-specific rules to make productive, low-risk changes to this monorepo.

## Do / Don't
Do:
- Keep commits minimal, purpose-driven, with conventional commit messages when changing packages (release uses conventional commits).
- Respect existing lint + formatting (ESLint + Prettier). Run `nx lint <project>` before suggesting changes.
- Export new public APIs only via each package's `src/index.ts`.
- Use existing patterns for services, events, interceptors, and plugins (see references below) instead of inventing new abstractions.
Don't:
- Modify root `package.json`, `nx.json`, any `CHANGELOG*`, or `renovate.json` unless explicitly requested.
- Introduce CommonJS wrappers; repo uses ESM (`"type": "module"`).
- Add broad dependencies; prefer `axios`, `qs`, `date-fns`, or stdlib.

## Repository Layout
Monorepo managed by Nx.
- `packages/core`: Core WooCommerce Store SDK (primary architectural reference).
- Other packages (`simple-jwt-login`, `jwt-authentication-for-wp-rest-api`, `hippoo`): Plugins / auth helpers exporting a single entry file.
- `apps/`: Example Angular app + Node example for manual testing, not published.

## Core Architecture (packages/core)
Entry: `src/index.ts` re-exports only stable surface.
- `Sdk` (`lib/sdk.ts`) orchestrates initialization: creates axios client (`createHttpClient`), installs interceptors, initializes plugins, prefetches cart, wires event listeners.
- `StoreService` (`lib/services/store.service.ts`) composes granular domain services (cart, products, orders, attributes, etc.) and exposes them via getters. Pattern: each domain file named `<entity>.service.ts` under `services/store/` and constructed with `(state, config, events)`.
- Event system: lightweight `EventBus` (`lib/bus/event.bus.ts`) with middleware, `once`, `waitFor`, scoped events. Events enumerated in `sdk.events.ts` — extend by adding string keys + typed payloads.
- HTTP: `createHttpClient` provides idempotent axios instance; `httpClient` is a proxy that throws until initialized. Always call `createHttpClient` in new init flows before using services.
- Interceptors: nonce + cart token (`lib/interceptors/*.interceptor.ts`) attach headers from config or state and emit `nonce:changed` / `cart:token:changed` events when response headers update tokens.
- Plugins: Implement `StoreSdkPlugin` (`lib/plugins/plugin.ts`) with `id`, `init()`, `extend(sdk)`, and `getConfig()`. Special-case logic for `simple-jwt-login` plugin inside `Sdk.init` (auth change triggers cart fetch + token clearing).
- State: `StoreSdkState` (see types) holds mutable runtime data like tokens; avoid storing derived/computable values.

## Adding a New Service
1. Create `packages/core/src/lib/services/store/<name>.service.ts` exporting a class `<PascalName>Service`.
2. Ctor signature `(state: StoreSdkState, config: StoreSdkConfig, events: EventBus<StoreSdkEvent>)`.
3. Add private field + getter in `StoreService` and initialize in constructor keeping alphabetical grouping consistent.
4. Re-export types/functions if part of public API via `src/index.ts` (avoid leaking internal-only helpers).

## Extending Events
1. Add new key in `sdk.events.ts` with correct payload type (use `?:` only for optional payload events).
2. Emit via `events.emit('your:event', payload)` inside services; consumers can `events.on` or `waitFor`.
3. Keep naming pattern `domain:action[:phase]` (e.g., `auth:token:refresh:start`).

## Plugins
Follow existing plugin id patterns; if adding new plugin-specific behavior to core `Sdk.init`, gate it by `plugin.id` and keep logic minimal (delegate heavy work to the plugin itself). Avoid adding cross-plugin conditionals.

## Tokens & Auth Flow
- Nonce + cart token fetched/updated transparently via interceptors. Config provides async `getToken/setToken/clearToken` hooks allowing persistence (localStorage, cookies, etc.).
- On `auth:changed` false, core clears both tokens if respective `clearToken` hooks exist.
- `simple-jwt-login` plugin config may include `fetchCartOnLogin`; when true, cart is refetched post-auth.

## Testing (Library Focus)
- Use Vitest; test config is via `tsconfig.spec.json`. Put tests under same directory tree (e.g., `src/lib/.../__tests__` or `tests/`) — follow existing naming `*.spec.ts`.
- For new event or interceptor behavior, write unit tests that mock axios via dependency injection (consider exporting small helper or using axios adapters). Keep tests deterministic (no network).
- Any change to a service (method signature, emitted events, URL/query construction, headers reliance) MUST be reflected in its corresponding `*.service.spec.ts` so tests stay in lockstep with runtime behavior. Update or add specs in the same commit.

## Build & Dev Workflows
- Build all libraries: `npx nx run-many -t build` (root script `dev:rebuild` also resets Nx cache and rebuilds).
- Example Angular app serve: `npm run serve:angular` (proxy uses `proxy.conf.json`).
- Node example: `nx serve @store-sdk/example-node` (auto builds first; esbuild no bundle by default).
- Release (version + changelog) is automated via Nx release using conventional commits; do not manually edit CHANGELOGs.

## Style & Types
- Strict TS (`tsconfig.base.json`) – no `any`; add precise types or generics. Use utility types rather than casts.
- Always export only needed utilities; avoid circular imports (notably between `index.ts` and deeper modules). Import internal code via relative paths (`./lib/...`).

## Safe Change Checklist (Before Proposing)
- New service or event wired through `StoreService` / `sdk.events.ts`.
- `Sdk.init` remains idempotent (multiple calls safe).
- No root config / release pipeline files changed without instruction.
- Added tests for new public behavior.

## Quick References
- Core orchestrator: `packages/core/src/lib/sdk.ts`
- Event bus: `packages/core/src/lib/bus/event.bus.ts`
- Interceptors: `packages/core/src/lib/interceptors/*.interceptor.ts`
- Public API barrel: `packages/core/src/index.ts`

Revise this file when architecture or patterns materially change; keep under ~50 lines of actionable guidance.
