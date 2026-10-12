module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    '.next',
    '.eslintrc.cjs',
    'vite.config.ts',
    'vitest.config.ts',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    'next.config.mjs',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prefer-const': 'warn',
    // Privacy guard: disallow unguarded global network primitives
    'no-restricted-globals': [
      'error',
      'fetch',
      'XMLHttpRequest'
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'window',
        property: 'fetch',
        message: 'Use guardedFetch or internalFetch from src/net/guardedFetch.ts instead of window.fetch',
      },
      {
        object: 'navigator',
        property: 'sendBeacon',
        message: 'Use guardedFetch or the privacy registry instead of navigator.sendBeacon',
      },
    ],
  },
  overrides: [
    {
      files: ['src/net/guardedFetch.ts'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-properties': 'off',
      },
    },
  ],
};
