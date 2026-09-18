import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'keycloak/**'],
  },
  {
    // Root config source: bundled by esbuild, runs in the browser.
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, System: 'readonly' },
    },
  },
  {
    // Demo MFEs: raw SystemJS.register bundles loaded directly by the
    // browser, not ES modules.
    files: ['demo-mfes/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, System: 'readonly' },
    },
  },
  {
    // Node tooling: build/config scripts and tests.
    files: ['scripts/**/*.js', 'build.js', 'test/**/*.js', 'eslint.config.js', 'commitlint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
