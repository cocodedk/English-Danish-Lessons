/// <reference types="vitest/config" />
import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Under Vitest the StyleX plugin's dev-server poll never stops (no httpServer to
// close), which delays exit by 10 s. The poll is only for dev HMR, so drop its hook.
const stylexPlugins = (testing: boolean) =>
  [stylex.vite()].flat().map((p): Plugin =>
    testing ? { ...(p as Plugin), configureServer: undefined } : (p as Plugin),
  )

// The app lives wherever its folder is served from: every built URL is relative.
export default defineConfig(({ mode }) => ({
  base: './',
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
  // ORDER IS LOAD-BEARING: the StyleX plugin must come before the React plugin.
  plugins: [...stylexPlugins(mode === 'test'), react()],
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    // Never raise: jsdom suites are heavy and two concurrent runs can exhaust memory.
    maxWorkers: 4,
  },
}))
