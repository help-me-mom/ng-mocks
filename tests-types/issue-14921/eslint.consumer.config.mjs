import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['tests-types/issue-14921/*.ts'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        project: './tests-types/issue-14921/tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
]);
