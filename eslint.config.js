import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/', '.opencode/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
      // TypeScript handles no-undef; the ESLint rule does not understand TS globals
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      // TypeScript handles no-undef for Svelte files with lang="ts"
      'no-undef': 'off',
    },
  },
  prettier,
  ...svelte.configs['flat/prettier'],
];
