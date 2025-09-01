import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  resolve: {
    preserveSymlinks: true,
  },
  cacheDir: '../../node_modules/.vite/packages/core',
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
      exclude: [
        // Pure type/interface definition folders (tree-shaken, no runtime)
        'src/lib/types/**',
        // Event map & plugin interface only contain types
        'src/lib/sdk.events.ts',
        'src/lib/plugins/plugin.ts',
        // Config types-only files
        'src/lib/configs/sdk.config.ts',
        'src/lib/configs/simple.jwt.login.config.ts',
        // Generated / build output & configs
        '**/dist/**',
        '**/eslint.config.*',
        'vite.config.ts',
        '**/test-output/**',
      ],
    },
  },
}));
