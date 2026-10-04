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
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'vitest.config.ts', 'tailwind.config.cjs', 'postcss.config.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'fetch',
        message: 'Direct fetch is forbidden for privacy. Use guardedFetch from src/net/guardedFetch.ts.',
      },
      {
        name: 'XMLHttpRequest',
        message: 'Direct XMLHttpRequest is forbidden. Use guardedFetch from src/net/guardedFetch.ts.',
      },
      {
        name: 'WebSocket',
        message: 'WebSockets are forbidden. Private Closet operates 100% locally.',
      },
      {
        name: 'EventSource',
        message: 'EventSource is forbidden. Private Closet operates 100% locally.',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'window',
        property: 'fetch',
        message: 'Direct window.fetch is forbidden. Use guardedFetch from src/net/guardedFetch.ts.',
      },
      {
        object: 'navigator',
        property: 'sendBeacon',
        message: 'Telemetry sendBeacon is strictly prohibited.',
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
