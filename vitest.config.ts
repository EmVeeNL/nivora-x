import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/__tests__/setup.ts'],
    include: ['app/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'plugin/build', 'e2e'],
    coverage: {
      provider: 'v8',
      include:  ['app/**/*.{ts,tsx}'],
      exclude:  ['app/__tests__/**'],
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
    },
  },
})
