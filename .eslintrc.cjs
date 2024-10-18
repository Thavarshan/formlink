module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
      experimentalObjectRestSpread: true
    }
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:mdx/recommended'
  ],
  ignorePatterns: ['temp.js', '**/vendor/*.js', '*.spec.ts', '*.test.ts'],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['warn', 'single'],
    '@typescript-eslint/no-explicit-any': 'off',
    semi: 'off',
    'comma-dangle': ['error', 'never'],
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'error'
  }
};
