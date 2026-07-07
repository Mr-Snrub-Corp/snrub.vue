import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults, coverageConfigDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json-summary', 'lcov'],
        // Count untested files, not just imported ones.
        all: true,
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          ...coverageConfigDefaults.exclude, // node_modules, *.spec.ts, *.d.ts, *.config.*
          'src/main.ts', // app bootstrap
          'src/views/dashboard/design/**', // PrimeVue showcase pages
          'src/components/icons/**', // static SVG components
          'src/test/**', // test support
        ],
        // Thresholds intentionally OFF in Phase 1 (informational). Enforced in Phase 3.
      },
    },
  }),
)
