# GitHub Copilot Instructions

## Repository Practices
- **Do not modify** `package.json`, `package-lock.json`, `nx.json`, any `CHANGELOG*`, or `renovate.json` unless explicitly instructed.
- Keep commits small and focused with clear messages.
- Use the existing Prettier and ESLint configurations for formatting and linting.

## Project Structure
- Place reusable libraries in `packages/`.
- Place applications or demo apps in `apps/`.
- Each library’s source resides under `src/lib/`.
- Every library must include a `src/lib/tests/` directory containing Vitest-based tests.
- Export the library’s public API from `src/index.ts`.

## Coding Style
- Use **TypeScript 5+** with `strict` mode enabled; avoid `any`.
- Prefer modern ESM `import` / `export` syntax.
- Keep functions small and pure; favor composition over inheritance.
- Follow path aliases defined in `tsconfig.base.json`.
- Document public APIs with TSDoc (`/** ... */`).

## Testing
- Write unit and integration tests using **Vitest** (`@analogjs/vitest-angular` for Angular code).
- Write tests only for libraries.
- Place tests under `src/lib/tests/` for libraries.
- Use `async/await` for asynchronous flows and handle errors with `try/catch`.
- Run `nx lint <project>` and `prettier --write` before committing.

## Dependencies & APIs
- Prefer built-in or well-maintained libraries (e.g., `axios`, `date-fns`).
- Keep dependencies up to date and avoid deprecated APIs.
