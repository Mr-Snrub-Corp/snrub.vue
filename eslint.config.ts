import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/*.spec.ts'],
  },
  
  skipFormatting,

  {
    name: 'app/rules',
    rules: {
      // CLAUDE.md forbids `any`; ratcheted to warn while existing usages are cleared.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    // Pages/layouts are conventionally single-word; rule stays enforced for components/**.
    name: 'app/views-single-word',
    files: ['src/views/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    // Config files legitimately use CommonJS require().
    name: 'app/config-files',
    files: ['**/*.config.{js,cjs,mjs,ts,cts,mts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    // Declaration/shim files use `{}` and augmentation type-params by design.
    name: 'app/declaration-files',
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
)
