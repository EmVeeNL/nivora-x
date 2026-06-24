import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Global ignores
  {
    ignores: ['plugin/build/**', 'plugin/vendor/**', 'node_modules/**'],
  },

  // TypeScript + React source
  {
    files: ['app/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project:     './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType:  'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react:                reactPlugin,
      'react-hooks':        reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript recommended + strict
      ...tsPlugin.configs['recommended'].rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,

      // React
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types':         'off', // TypeScript handles this

      // Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // Project rule: index access under noUncheckedIndexedAccess must be cast
      '@typescript-eslint/no-unnecessary-condition': 'error',
    },
  },

  // Prettier must be last (disables conflicting formatting rules)
  prettierConfig,
]
