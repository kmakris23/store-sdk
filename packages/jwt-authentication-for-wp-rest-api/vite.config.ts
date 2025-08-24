import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  resolve: {
    preserveSymlinks: true,
  },
  cacheDir:
    '../../node_modules/.vite/packages/jwt-authentication-for-wp-rest-api',
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
    passWithNoTests: true,
  },
}));
