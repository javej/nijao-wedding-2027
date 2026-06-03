import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // No @vitejs/plugin-react: that's for HMR/Fast Refresh, which tests don't use,
  // and v6 is incompatible with the Vite 7 that Vitest 4 bundles. esbuild does
  // the JSX transform; `jsx: automatic` matches tsconfig's react-jsx runtime.
  plugins: [tsconfigPaths()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    // e2e/ holds Playwright specs (own runner); never let Vitest pick them up.
    exclude: ['**/node_modules/**', '**/.next/**', '**/e2e/**'],
    // Clear mock call history before each test (mock impls are re-set per test).
    clearMocks: true,
  },
});
