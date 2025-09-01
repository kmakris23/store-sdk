# GitHub Copilot / AI Agent Instructions

Comprehensive guide for efficiently working with the WooCommerce Store API SDK monorepo. This TypeScript-first SDK provides seamless integration with WooCommerce Store API endpoints, supporting guest and authenticated users through a plugin-based authentication system.

## 📋 Repository Overview

**What it does**: TypeScript WooCommerce Store API SDK for headless e-commerce development, featuring comprehensive API coverage (products, cart, checkout, orders), event-driven architecture, and multi-authentication support.

**Tech stack**: Node.js 20+ • Nx 21.4.1 monorepo • TypeScript 5.8 • Vitest testing • ESLint/Prettier • Angular 20 example

**Size**: Medium monorepo (~2000 files, ~1min install time) with 5 packages + 1 example app. Pure ESM (`"type": "module"`).

**Structure**:

- `packages/core` - Main WooCommerce Store SDK (81 unit tests)
- `packages/simple-jwt-login` - Auth plugin for Simple JWT Login WordPress plugin
- `packages/jwt-authentication-for-wp-rest-api` - Auth plugin for JWT Auth WP plugin
- `packages/hippoo` - Auth plugin for Hippoo WordPress plugin
- `apps/example-angular-shop` - Example Angular 20 application

## 🚀 Environment Setup & Build Commands

**Prerequisites**: Node.js 20+, npm 10+ (verified with Node 20.19.4, npm 10.8.2)

### Bootstrap (First Time Setup)

```bash
npm install  # ~60 seconds, includes all dependencies
```

**ALWAYS** run `npm install` before any other command - this is required and non-optional.

### Build Commands (Validated Working Order)

```bash
# Build all projects (takes ~6-7 seconds)
npx nx run-many -t build

# Build specific project
npx nx build core
npx nx build simple-jwt-login

# Clean rebuild (resets Nx cache, takes ~7 seconds)
npm run dev:rebuild
```

### Testing Commands

```bash
# Run all tests (core has 81 passing tests, takes ~2 seconds)
npx nx run-many -t test

# Test specific project
npx nx test core

# Tests use Vitest, placed in src/lib/tests/ or alongside source files
# Test files must be named *.spec.ts or *.test.ts
```

### Linting & Formatting (MANDATORY)

```bash
# Format check - MUST PASS before any PR
npx prettier --check .

# Fix formatting issues
npx prettier --write .

# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint core
```

### Development Server

```bash
# Serve Angular example app (auto-rebuilds on changes)
npm run serve:angular
# Access at http://localhost:4200 (if port available)
```

## 🏗 Build System & Validation

**Build tools**: TypeScript compiler (`tsc`) for libraries, Angular CLI for apps, Nx for orchestration/caching

**Critical validation steps**:

1. **Format check ALWAYS required**: `npx prettier --check .` must pass
2. **Build validation**: All libraries use `tsc --build tsconfig.lib.json`
3. **Lint before commit**: Run `npx nx lint <project>` for any service/API changes
4. **Test coverage**: Core package has comprehensive unit test suite (81 tests)

**Build timing**:

- Clean install: ~60 seconds
- Full build: ~6-7 seconds
- Individual project build: ~1-2 seconds
- Test suite: ~2 seconds
- Lint all: ~3-5 seconds

**Common build issues**:

- Missing `npm install` - always run first
- Format check failures - run `npx prettier --write .` to fix
- ESM module warnings - expected for CommonJS dependencies (qs)

## 📁 Project Layout & Architecture

### Root Structure

```
├── .github/workflows/        # CI/CD pipelines
├── packages/                 # SDK packages
│   ├── core/                # Main SDK package
│   ├── simple-jwt-login/    # Auth plugin
│   ├── jwt-authentication-for-wp-rest-api/  # Auth plugin
│   └── hippoo/              # Auth plugin
├── apps/
│   └── example-angular-shop/  # Example Angular app
├── package.json              # Root workspace config
├── nx.json                   # Nx monorepo config
├── tsconfig.base.json        # Shared TypeScript config
├── eslint.config.mjs         # ESLint configuration
└── .prettierrc               # Prettier config {"singleQuote": true}
```

### Core Package Architecture (`packages/core/src/`)

```
├── index.ts                  # Public API exports (ONLY TOUCH THIS FILE)
└── lib/
    ├── sdk.ts               # Main SDK orchestrator & initialization
    ├── configs/             # Configuration types & interfaces
    ├── services/
    │   ├── api.js           # HTTP client (axios) & interceptors
    │   └── store/           # Domain services (cart, products, orders, etc.)
    ├── bus/
    │   └── event.bus.ts     # Event system implementation
    ├── interceptors/        # HTTP interceptors (nonce, cart tokens)
    ├── plugins/             # Plugin architecture
    ├── types/               # TypeScript type definitions
    ├── utilities/           # Helper functions
    └── tests/               # Unit tests (*.spec.ts)
```

**Key files to understand**:

- `sdk.ts` - Main orchestrator (creates HTTP client, installs interceptors, initializes plugins)
- `services/store.service.ts` - Aggregates all domain services via getters
- `bus/event.bus.ts` - Event system with middleware, once, waitFor
- `index.ts` - **ONLY** file for public API exports

## 🔧 Development Workflow

### Making Changes

1. **ALWAYS**: Run `npx prettier --check .` first
2. Make minimal, focused changes
3. **Build validation**: `npx nx build <affected-project>`
4. **Test validation**: `npx nx test <affected-project>`
5. **Lint validation**: `npx nx lint <affected-project>`
6. **Format validation**: `npx prettier --check .`

### Adding New Services (Core Pattern)

1. Create `packages/core/src/lib/services/store/<name>.service.ts`
2. Constructor: `(state: StoreSdkState, config: StoreSdkConfig, events: EventBus<StoreSdkEvent>)`
3. Add private field + getter to `StoreService` (alphabetical order)
4. Export types/functions via `src/index.ts` ONLY
5. Add corresponding `<name>.service.spec.ts` test file

### Plugin Development

- Implement `StoreSdkPlugin` interface
- Use exact `plugin.id` patterns
- Delegate logic to plugin, keep SDK core minimal
- Follow existing auth plugin patterns

## 🚨 Critical CI/CD Pipeline

**GitHub Actions** (`.github/workflows/ci.yml`):

1. **setup-and-cache**: Install deps, cache Nx
2. **lint**: `npx nx affected -t lint` (parallel)
3. **format**: `npx prettier --check .` (MUST PASS)
4. **test**: `npx nx affected -t test` (parallel)
5. **build**: `npx nx affected -t build` (parallel)

**All PRs must pass**: format check, lint, tests, and build

**Release automation**: Uses Nx + conventional commits - never hand-edit CHANGELOGs

## ✅ Do's and ❌ Don'ts

### ✅ Always Do

- Run `npx prettier --check .` before any commit/PR
- Use conventional commit messages for releases
- Export new APIs only via each package's `src/index.ts`
- Follow existing patterns (services, events, interceptors, plugins)
- Keep commits minimal and focused
- Update tests for service/API changes in same commit
- Add / update unit or integration tests for every behavioral change (no untested code paths)
- Maintain near-100% coverage (target ≥ 98% statements / lines for executable code). If coverage would drop, add tests or clearly justify excluded lines (types-only, config, generated, or pure re-export files)

### ❌ Never Do

- Modify `package.json`, `nx.json`, `CHANGELOG*`, `renovate.json` without explicit request
- Introduce CommonJS wrappers (pure ESM repo)
- Add unnecessary dependencies (prefer axios, qs, date-fns, stdlib)
- Skip format checks - they will fail CI
- Make cross-plugin dependencies or branching logic

## 🧪 Testing Strategy

**Framework**: Vitest with node environment, 81 tests in core package

**Test locations**:

- `src/lib/tests/unit/` for organized test suites
- Adjacent to source files for focused testing
- Name: `*.spec.ts` or `*.test.ts`

**Test patterns**:

- Mock HTTP calls (`doGet/doPost`) - no real network
- Test event emissions and interceptor behavior
- Service signature changes REQUIRE test updates
- Plugin integration testing with multiple scenarios

**Running tests**: `npx nx test <project>` or `npx nx run-many -t test`

## 📈 Coverage Policy (MANDATORY)

**Goal**: Keep executable source coverage effectively at 100% (minimum 98% statements & lines) for the `packages/core` library and any modified packages.

### Principles

- Every PR that changes runtime logic must include or update tests covering the new / altered branches, error paths, and edge cases.
- Pure type definition, configuration, build, or barrel export files may be excluded from coverage (no executable logic). Do **not** exclude files with runtime branches just to raise numbers.
- When adding a new feature, create tests first (red → green) where practical; at minimum ensure failing coverage locally would catch missing tests.
- Interceptor, event bus, and utility edge branches (error handling, early returns, disposers) must be covered unless unreachable by design.
- If a line cannot be reasonably tested (e.g., defensive impossible branch), annotate with a brief code comment explaining why.

### Required Workflow Additions

1. Run full test suite with coverage before pushing: `npx nx test core --coverage` (or run-many for multi-package changes).
2. Verify thresholds (CI can be configured later to enforce; treat violations as blockers now).
3. Refuse merging if coverage regresses below target without an explicit, reviewed justification.

### Common Gaps To Watch

- Early returns (guards) and error throw branches (e.g., uninitialized SDK, waitFor timeouts).
- Middleware registration/disposal and event bus once / scope behaviors.
- HTTP interceptor disabled paths and token refresh/error branches.
- Utility error handling (Axios catch blocks) and optional parameter defaults.

### Anti-Patterns (Avoid)

- Adding broad coverage exclusions instead of writing tests.
- Combining numerous unrelated changes in a single PR (harder to attribute coverage drops).
- Relying only on integration tests for fine-grained logic (keep unit tests precise & fast).

### When Coverage Dips Temporarily

If refactors temporarily lower coverage, add a TODO comment plus a follow-up test task in the same PR description; resolve before merge if at all possible.

> Treat high coverage as a quality gate: fast feedback, safer refactors, and clearer plugin/extensibility guarantees.

## 🔗 Quick Reference Commands

```bash
# Essential workflow commands (copy-paste ready)
npm install                           # Bootstrap (required first)
npx prettier --check .               # Format validation (required for PRs)
npx prettier --write .               # Fix formatting issues
npx nx run-many -t build            # Build all projects
npx nx run-many -t test             # Test all projects
npx nx run-many -t lint             # Lint all projects
npm run dev:rebuild                  # Clean rebuild with cache reset

# Individual project commands
npx nx build core                    # Build core SDK
npx nx test core                     # Test core SDK (81 tests)
npx nx lint core                     # Lint core SDK

# Development
npm run serve:angular                # Start Angular example
npx nx --version                     # Check Nx version (21.4.1)
npx nx show projects                 # List all projects
```

**Trust these instructions** - all commands have been validated to work correctly. Only search for additional information if these instructions are incomplete or found to be incorrect.
