import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import esXPlugin from 'eslint-plugin-es-x';
import importPlugin from 'eslint-plugin-import-x';
import jsonPlugin from '@eslint/json';
import * as mdxPlugin from 'eslint-plugin-mdx';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import ymlPlugin from 'eslint-plugin-yml';
import globals from 'globals';
import * as espree from 'espree';

const projects = [
  './tsconfig.eslint.json',
  './tests-e2e/tsconfig.json',
  './e2e/a5es5/tsconfig.json',
  './e2e/a5es2015/tsconfig.json',
  './e2e/a6/tsconfig.json',
  './e2e/a7/tsconfig.json',
  './e2e/a8/tsconfig.json',
  './e2e/a9/tsconfig.json',
  './e2e/a10/tsconfig.json',
  './e2e/a11/tsconfig.json',
  './e2e/a12/tsconfig.json',
  './e2e/a13/tsconfig.json',
  './e2e/a14/tsconfig.json',
  './e2e/a15/tsconfig.json',
  './e2e/a16/tsconfig.json',
  './e2e/a17/tsconfig.json',
  './e2e/a18/tsconfig.json',
  './e2e/a19/tsconfig.json',
  './e2e/a20/tsconfig.json',
  './e2e/a21/tsconfig.json',
  './e2e/a22/tsconfig.json',
  './e2e/jasmine/tsconfig.json',
  './e2e/jest/tsconfig.json',
  './e2e/min/tsconfig.json',
  './e2e/nx/tsconfig.json',
];

const prettierRules = prettierRecommended.rules;

const tsJsRules = {
  ...js.configs.recommended.rules,
  ...tsEslintPlugin.configs.recommended.rules,
  ...angularEslintPlugin.configs.recommended.rules,
  ...unicornPlugin.configs.recommended.rules,
  ...importPlugin.configs.recommended.rules,
  ...importPlugin.configs.typescript.rules,
  ...prettierRules,

  'arrow-parens': 'off',
  'arrow-body-style': 'off',
  'spaced-comment': ['error', 'always'],
  complexity: ['error', 50],
  'unicorn/filename-case': ['error', { case: 'kebabCase', checkDirectories: false }],
  'max-lines': ['error', 500],
  'max-lines-per-function': ['error', 150],

  '@angular-eslint/no-input-rename': 'off',
  '@angular-eslint/no-inputs-metadata-property': 'off',
  '@angular-eslint/no-output-rename': 'off',
  '@angular-eslint/no-outputs-metadata-property': 'off',
  '@angular-eslint/prefer-standalone': 'off',
  '@angular-eslint/prefer-inject': 'off',

  '@typescript-eslint/no-empty-interface': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-namespace': 'off',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-restricted-types': 'error',
  '@typescript-eslint/no-this-alias': 'off',
  '@typescript-eslint/no-unsafe-declaration-merging': 'off',
  '@typescript-eslint/no-unused-vars': 'error',

  'unicorn/expiring-todo-comments': 'off',
  'unicorn/better-dom-traversing': 'off',
  'unicorn/class-reference-in-static-methods': 'off',
  'unicorn/comment-content': 'off',
  'unicorn/consistent-boolean-name': 'off',
  'unicorn/consistent-conditional-object-spread': 'off',
  'unicorn/consistent-class-member-order': 'off',
  'unicorn/logical-assignment-operators': 'off',
  'unicorn/max-nested-calls': 'off',
  'unicorn/no-anonymous-default-export': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-for-each': 'off',
  'unicorn/no-array-splice': 'off',
  'unicorn/no-array-sort': 'off',
  'unicorn/no-array-reverse': 'off',
  'unicorn/no-array-method-this-argument': 'off',
  'unicorn/no-break-in-nested-loop': 'off',
  'unicorn/no-computed-property-existence-check': 'off',
  'unicorn/no-declarations-before-early-exit': 'off',
  'unicorn/no-duplicate-if-branches': 'off',
  'unicorn/no-for-loop': 'off',
  'unicorn/no-mismatched-map-key': 'off',
  'unicorn/no-non-function-verb-prefix': 'off',
  'unicorn/no-nonstandard-builtin-properties': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-return-array-push': 'off',
  'unicorn/no-this-outside-of-class': 'off',
  'unicorn/no-this-assignment': 'off',
  'unicorn/no-top-level-assignment-in-function': 'off',
  'unicorn/no-top-level-side-effects': 'off',
  'unicorn/no-typeof-undefined': 'off',
  'unicorn/no-unnecessary-boolean-comparison': 'off',
  'unicorn/no-unnecessary-splice': 'off',
  'unicorn/no-unnecessary-polyfills': 'off',
  'unicorn/no-unreadable-for-of-expression': 'off',
  'unicorn/no-unreadable-new-expression': 'off',
  'unicorn/no-unsafe-property-key': 'off',
  'unicorn/no-unsafe-string-replacement': 'off',
  'unicorn/no-unused-array-method-return': 'off',
  'unicorn/no-useless-concat': 'off',
  'unicorn/no-useless-fallback-in-spread': 'off',
  'unicorn/no-useless-template-literals': 'off',
  'unicorn/no-useless-undefined': 'off',
  'unicorn/prefer-array-from-map': 'off',
  'unicorn/prefer-array-flat': 'off',
  'unicorn/prefer-at': 'off',
  'unicorn/prefer-await': 'off',
  'unicorn/prefer-boolean-return': 'off',
  'unicorn/prefer-continue': 'off',
  'unicorn/prefer-early-return': 'off',
  'unicorn/prefer-event-target': 'off',
  'unicorn/prefer-global-number-constants': 'off',
  'unicorn/prefer-global-this': 'off',
  'unicorn/prefer-https': 'off',
  'unicorn/prefer-includes': 'off',
  'unicorn/prefer-includes-over-repeated-comparisons': 'off',
  'unicorn/prefer-minimal-ternary': 'off',
  'unicorn/prefer-module': 'off',
  'unicorn/prefer-number-coercion': 'off',
  'unicorn/prefer-object-define-properties': 'off',
  'unicorn/prefer-object-iterable-methods': 'off',
  'unicorn/prefer-scoped-selector': 'off',
  'unicorn/prefer-set-has': 'off',
  'unicorn/prefer-spread': 'off',
  'unicorn/prefer-string-starts-ends-with': 'off',
  'unicorn/prefer-string-raw': 'off',
  'unicorn/prefer-string-replace-all': 'off',
  'unicorn/prefer-switch': 'off',
  'unicorn/prefer-ternary': 'off',
  'unicorn/prefer-top-level-await': 'off',
  'unicorn/prefer-type-error': 'off',
  'unicorn/prefer-type-literal-last': 'off',
  'unicorn/name-replacements': 'off',
  'unicorn/require-array-sort-compare': 'off',

  'es-x/no-array-from': 'error',
  'es-x/no-array-isarray': 'off',
  'es-x/no-array-of': 'error',
  'es-x/no-array-prototype-copywithin': 'error',
  'es-x/no-array-prototype-entries': 'error',
  'es-x/no-array-prototype-every': 'error',
  'es-x/no-array-prototype-fill': 'off',
  'es-x/no-array-prototype-filter': 'off',
  'es-x/no-array-prototype-find': 'error',
  'es-x/no-array-prototype-findindex': 'error',
  'es-x/no-array-prototype-flat': 'error',
  'es-x/no-array-prototype-foreach': 'error',
  'es-x/no-array-prototype-includes': 'error',
  'es-x/no-array-prototype-indexof': 'off',
  'es-x/no-array-prototype-keys': 'error',
  'es-x/no-array-prototype-lastindexof': 'error',
  'es-x/no-array-prototype-map': 'off',
  'es-x/no-array-prototype-reduce': 'error',
  'es-x/no-array-prototype-reduceright': 'error',
  'es-x/no-array-prototype-some': 'off',
  'es-x/no-array-prototype-values': 'error',
  'es-x/no-array-string-prototype-at': 'error',

  'import-x/no-unresolved': 'off',

  'no-alert': 'error',
  'no-console': ['error', { allow: ['error', 'warn'] }],
  'no-debugger': 'error',
  // The library targets ES5, where ErrorOptions cause is not part of the public type/runtime contract.
  'preserve-caught-error': 'off',
  'no-restricted-globals': ['error', 'fit', 'fdescribe', 'xit', 'xdescribe'],
  semi: ['error', 'always'],
  quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  'import-x/order': [
    'error',
    {
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      groups: ['builtin', 'external', 'internal', 'index', 'parent', 'sibling'],
      pathGroups: [
        {
          pattern: '@angular/**',
          group: 'external',
        },
      ],
    },
  ],
  'unused-imports/no-unused-imports': 'error',
  'prefer-arrow/prefer-arrow-functions': ['error', { allowStandaloneDeclarations: true }],
};

export default [
  {
    ignores: [
      '.*',
      '**/.*',
      '.dockerignore',
      '.gitignore',
      '.prettierignore',
      'CHANGELOG.md',
      'CODEOWNERS',
      'renovate.json',
      'dist/**',
      'docs/.docusaurus/**',
      'docs/articles/**/*.md',
      'docs/src/css/**',
      'e2e/*/dist/**',
      'e2e/*/.angular/**',
      'e2e/*/src/app/**',
      'e2e/*/src/test/**',
      'node_modules/**',
      'test-reports/**',
      'tests-e2e/.angular/**',
      'tests-e2e/dist/**',
      'tests-failures/**',
      'tmp/**',
      '**/*.sh',
      '**/*.snap',
      '**/.nvmrc',
      '**/.browserslistrc',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsEslintParser,
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      '@angular-eslint': angularEslintPlugin,
      '@angular-eslint/template': angularEslintTemplatePlugin,
      unicorn: unicornPlugin,
      'import-x': importPlugin,
      prettier: prettierPlugin,
      'unused-imports': unusedImportsPlugin,
      'prefer-arrow': preferArrowPlugin,
      'es-x': esXPlugin,
    },
    processor: angularEslintTemplatePlugin.processors['extract-inline-html'],
    settings: {
      ...importPlugin.configs['flat/typescript'].settings,
      'import-x/resolver': {
        typescript: {
          noWarnOnMultipleProjects: true,
          project: projects,
        },
      },
      'es-x': {
        aggressive: true,
      },
    },
    rules: tsJsRules,
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        project: projects,
      },
    },
    rules: tsEslintPlugin.configs['eslint-recommended'].overrides[0].rules,
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'no-useless-assignment': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-logical-operator-over-ternary': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: espree,
      globals: globals.node,
    },
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
  {
    files: [
      '**/decorate-angular-cli.js',
      '**/jest.config.js',
      '**/jest.preset.js',
      '**/karma.conf.js',
      '**/webpack.config.js',
    ],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularEslintTemplatePlugin,
    },
    rules: {
      ...angularEslintTemplatePlugin.configs.recommended.rules,
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['**/tsconfig.json', '**/tsconfig.*.json'],
    plugins: {
      ...jsonPlugin.configs.recommended.plugins,
      prettier: prettierPlugin,
    },
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
      ...prettierRules,
    },
  },
  {
    files: ['**/tsconfig.json', '**/tsconfig.*.json'],
    plugins: {
      ...jsonPlugin.configs.recommended.plugins,
      prettier: prettierPlugin,
    },
    language: 'json/jsonc',
    languageOptions: {
      allowTrailingCommas: true,
    },
    rules: {
      'json/no-duplicate-keys': 'error',
      ...prettierRules,
    },
  },
  {
    ...mdxPlugin.flat,
    files: ['**/*.md'],
    plugins: {
      ...mdxPlugin.flat.plugins,
      prettier: prettierPlugin,
    },
    rules: {
      ...mdxPlugin.flat.rules,
      ...prettierRules,
    },
  },
  ...ymlPlugin.configs.prettier,
  {
    files: ['**/*.yaml', '**/*.yml'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierRules,
    },
  },
];
