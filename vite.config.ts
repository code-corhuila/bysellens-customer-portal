import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/mfe/customer/',
  publicDir: 'node_modules/@bysellens/frontend-core/assets',
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  test: { server: { deps: { inline: ['@bysellens/frontend-core'] } }, globals: true, environment: 'jsdom', setupFiles: 'node_modules/@bysellens/frontend-core/testing/setupTests.ts' },
}));
