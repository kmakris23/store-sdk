## Store SDK Monorepo – Coding Agent Onboarding

Purpose: Fast, low-error contributions to a TypeScript / Nx monorepo that provides a headless WooCommerce Store API SDK plus authentication plugins and an Angular example app.

Keep output concise, deterministic, and conformant with repo conventions. Follow these instructions before making ANY change.

---

### 1. What This Repo Does

TypeScript-first SDK for WooCommerce Store API (products, cart, checkout, orders, catalog metadata) with:

- Event-driven core (custom EventBus) and plugin-based auth (Simple JWT Login, JWT Auth, Hippoo)
- Automatic nonce, cart token, JWT & refresh token interceptors (Axios)
- Strongly typed service layer grouped under `StoreSdk.store.*`
- Angular example app demonstrating consumption

Primary deliverable: Published packages under `@store-sdk/*` (core + auth plugins). Everything else supports development & testing.

---

### 2. Tech Stack (Authoritative)

- Node 20+, npm workspaces, Nx 21.4.1, Pure ESM (`"type": "module"`)
- TypeScript 5.8, Vitest (unit/integration/flow tests), Axios, qs
- Angular 20 (example only – do NOT introduce Angular deps into libraries)
- Tailwind/PostCSS for example app styling
- Docker Compose WordPress env for plugin auth integration tests (optional for most changes)

---

### 3. Project Structure (High Signal)

```
packages/
  core/ (main SDK: services, interceptors, event bus, plugins infra)
  simple-jwt-login/ (auth plugin)
  jwt-authentication-for-wp-rest-api/ (auth plugin)
  hippoo/ (auth plugin)
apps/
  example-angular-shop/ (demo storefront)
infra/wordpress/ (docker-compose + setup scripts)
scripts/ (test docs generator, WP plugin test)
docs/TESTS.md (auto-generated test index)
.github/ (CI workflows + THIS file)
```

Core internals (most edits happen here):
`packages/core/src/lib/`

- `sdk.ts` (init logic, plugin application, interceptors)
- `services/` (domain services; store services under `services/store/*.service.ts`)
- `services/api.ts` (Axios instance & helpers)
- `interceptors/*.interceptor.ts` (nonce, cart token, token, refresh token)
- `bus/event.bus.ts` (EventBus with on / once / onAny)
- `plugins/` (shared plugin types + plugin-specific extension points)
- `types/` (shared TS interfaces / DTOs)
- `utilities/` (jwt, axios helpers)
- `tests/` (unit / integration / flow organization)

Public API surface for each package is ONLY via `src/index.ts`. Never deep-import internal files from outside their own package; add exports instead.

---

### 4. Golden Path Workflow (Always Follow)

1. `npm install` (MANDATORY—fail fast if node_modules missing)
2. Format check first: `npx prettier --check .` (fix with `--write` before committing)
3. Implement change (see section 5 for patterns)
4. Build affected lib: `npx nx build core` (or plugin name). Use `npx nx run-many -t build` for multi-package edits.
5. Run tests: `npx nx test core` (add `--coverage` if changing runtime logic)
6. Lint: `npx nx lint core`
7. Ensure no unintended public API leaks: verify `index.ts` exports only intended symbols.
8. Update / add tests for new branches (coverage target ≥ 98%; never regress without explicit justification)
9. Re-run full suite & format before final output.

CI will enforce (in order): install/cache, lint (affected), prettier check, test, build. Local parity reduces iteration churn.

---

### 5. Implementation Patterns

Adding a new Store service:

1. Create file: `packages/core/src/lib/services/store/<domain>.service.ts`
2. Constructor signature: `(state: StoreSdkState, config: StoreSdkConfig, events: EventBus<StoreSdkEvent>)`
3. Use shared Axios helpers (do NOT create new axios instances) – import from `services/api.js`
4. Emit events with consistent naming: `'<entity>:<action>'` (e.g. `cart:updated`) only when state materially changes.
5. Add private field + getter in `store.service.ts` (alphabetical order by property name group when practical)
6. Export types/functions via `packages/core/src/index.ts` only.
7. Write unit tests under `tests/unit/...` or integration under `tests/integration/...` mirroring existing structure; name `*.spec.ts`.

Interceptors:

- Keep idempotent; guard against duplicate installation.
- Respect `config.auth?.useTokenInterceptor` & `useRefreshTokenInterceptor` flags.

Plugins:

- Implement `StoreSdkPlugin` interface.
- Provide `init()`, `registerEventHandlers?`, `extend?` as needed.
- NEVER directly mutate unrelated plugin state.

Events:

- Use EventBus; avoid global side effects.
- If adding new event names, ensure tests assert emission (happy & error paths when meaningful).

Error Handling:

- Return typed result objects (data / error) consistent with existing patterns.
- No silent catches—log (if future logging infra added) or bubble up.

---

### 6. Coding & Style Guidelines

- Pure ESM: always use explicit `.js` extension in relative imports inside source TypeScript (already configured via TS emit). Do NOT introduce CommonJS.
- Maintain alphabetical or logical grouping in export barrels; avoid reshuffling unrelated lines.
- Avoid speculative abstractions—mirror WooCommerce endpoints directly.
- Strong, explicit assertions in tests (no truthy/falsy shortcuts).
- Prefer small, focused commits; no drive-by reformatting.
- Do not edit root `package.json`, Nx configs, or CHANGELOGs unless the task explicitly requires it.

---

### 7. Available Scripts (High-Value)

- Build all: `npx nx run-many -t build`
- Test all: `npx nx run-many -t test`
- Lint all: `npx nx run-many -t lint`
- Clean rebuild: `npm run dev:rebuild`
- Generate test docs: `npm run docs:tests`
- WordPress env up: `npm run wp:env:up` (optional, slower; only for plugin integration flows)
- Angular example serve: `npm run serve:angular`

Use Nx targets over ad‑hoc TypeScript/Vitest commands to leverage caching and consistent options.

---

### 8. Testing Strategy (Essentials)

- Unit: Fast logic & service method behavior.
- Integration: Interplay of services, interceptors, and events (no real HTTP calls—mock axios if needed).
- Flow: Higher-level multi-step flows.
- Always add tests for new branches (success + at least one failure path).
- Regenerate test index after adding specs: `npm run docs:tests` (optional but keeps docs fresh).

Coverage discipline: If runtime code changes and coverage dips below threshold, add tests immediately—do not mark lines ignored unless they are pure types or defensive impossible branches (comment why if skipped).

---

### 9. Performance & Reliability Guardrails

- Avoid introducing new network calls outside existing HTTP client.
- Debounce or batch only if a performance problem is proven—otherwise keep implementation direct.
- Prevent duplicate interceptor registration (track with module-level boolean if adding new one).

---

### 10. Common Pitfalls (Avoid)

- Forgetting `npm install`: leads to missing peer dep errors.
- Omitting `.js` extension in new relative imports.
- Exporting internal helpers unintentionally (inflates public API surface).
- Adding service without wiring getter in `store.service.ts` (undefined at runtime).
- Writing broad test assertions (`expect(res).toBeTruthy()`).
- Skipping Prettier check (CI failure). Run `npx prettier --write .` if needed.

---

### 11. Minimal Sample Feature (Template)

Example: New service `product.inventory.service.ts` to expose `/products/<id>/inventory`.
Steps (do this adaptively for real tasks):

1. Add service file under `services/store/` implementing required methods.
2. Add private field + getter in `store.service.ts` (`inventory`).
3. Export via `src/index.ts` if public.
4. Add tests under `tests/unit/store/product.inventory.service.spec.ts` covering: successful fetch, not-found (error branch), event emission if state tracked.
5. Run build, test, lint, format.

---

### 12. When Unsure

If documentation missing for Nx behavior or generators: query Nx docs (internal tool) instead of guessing. Prefer reading existing similar service or plugin for exact pattern replication.

---

### 13. Output Expectations for Agent

Before finishing a task:

- Report Build PASS/FAIL, Lint PASS/FAIL, Test PASS/FAIL, Format PASS/FAIL.
- List touched files + rationale.
- Map each explicit user requirement to Done/Deferred (with reason).

If blocked by missing data (e.g., endpoint spec), request minimal clarifying info instead of stalling.

---

### ❌ Never Do

- Modify `package.json`, `nx.json`, `CHANGELOG*`, `renovate.json` without explicit request
- Introduce CommonJS wrappers (pure ESM repo)
- Add unnecessary dependencies (prefer axios, qs, date-fns, stdlib)
- Skip format checks - they will fail CI
- Make cross-plugin dependencies or branching logic

**Trust these instructions** - all commands have been validated to work correctly. Only search for additional information if these instructions are incomplete or found to be incorrect.
