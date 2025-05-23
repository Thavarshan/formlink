import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import * as mdx from 'eslint-plugin-mdx';

export default [
  {
    ignores: ['temp.js', '**/vendor/*.js', '*.spec.ts', '*.test.ts'],
    files: ['**/*.{js,ts,tsx,mdx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: false
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      mdx
    },
    rules: {
      // ESLint recommended
      'no-unused-vars': 'off',
      'no-console': 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['warn', 'single'],
      semi: 'off',
      'comma-dangle': ['error', 'never'],
      // TypeScript recommended
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
      // Add more rules as needed
    }
  }
];
