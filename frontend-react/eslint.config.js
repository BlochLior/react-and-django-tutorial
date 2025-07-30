import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import vitestGlobals from 'eslint-plugin-vitest-globals'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    plugins: {
      'vitest-globals': vitestGlobals, // Register the vitest-globals plugin
    },
    languageOptions: {
      globals: {
        ...globals.browser, // Include broswer globals (window, document) if the tests use them.
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly', // for Vitests' mocking utilities
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        suite: 'readonly',
        ...vitestGlobals.configs.recommended.globals, // Addd vitest's global variables (describe, it, expect, etc.)
      },
    },
  }
])
