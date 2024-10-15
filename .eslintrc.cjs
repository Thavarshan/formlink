/* eslint-env node */

const { defineConfig } = require('eslint-define-config');
const prettierConfig = require('./.prettierrc.cjs');

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:vue/vue3-essential',
    'plugin:vuejs-accessibility/recommended',
    'prettier', // Ensures ESLint and Prettier compatibility
  ],
  plugins: ['prettier', 'vue', 'vuejs-accessibility', '@typescript-eslint', 'import'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    extraFileExtensions: ['.vue'], // To support linting of .vue files
  },
  rules: {
    // General Code Quality Rules
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true, // Allow longer comments if needed
        ignoreStrings: true, // Allow long strings
        ignoreTemplateLiterals: true,
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': [
      'warn',
      {
        anonymous: 'ignore',
        named: 'never',
        asyncArrow: 'always',
        constructor: 'never',
      },
    ],

    // Prettier Integration
    'prettier/prettier': [
      'error',
      {
        ...prettierConfig, // Use the existing Prettier config
      },
    ],

    // Vue Rules
    'vue/html-indent': ['error', 2],
    'vue/multiline-html-element-content-newline': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 0,
    'vue/require-default-prop': 0,

    // TypeScript Rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_$',
        argsIgnorePattern: '^_$',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off', // Relax for now, can tighten later

    // Accessibility Rules
    'vuejs-accessibility/label-has-for': 'off', // Turn off if not needed
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json', // Ensure TypeScript resolver works correctly
      },
    },
  },
  ignorePatterns: ['*.test.ts', 'dist/', 'node_modules/'], // Ignore build and node files
  overrides: [
    {
      files: ['tests/**/*'],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.vue'],
      rules: {
        'max-len': 'off', // Turn off max-len in Vue templates
      },
    },
  ],
});
