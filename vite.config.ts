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

// The literal project path below is the one sanctioned place for it outside
// the GitHub Actions workflows (see CLAUDE.md).
export default defineConfig(({ mode }) => ({
  base: '/English-Danish-Lessons/',
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
