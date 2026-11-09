// eslint flat config — correctness-only. The engine is plain ESM .mjs with no
// framework; stylistic rules are intentionally absent. Turning anything on
// here means "this catches real bugs" — not taste.
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'models/**', 'public/film/**', 'studio/projects/**/out/**', 'studio/projects/**/frames/**'],
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, Bun: 'readonly' },
    },
    rules: {
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
      'no-func-assign': 'error',
      'no-cond-assign': ['error', 'except-parens'],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-fallthrough': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-obj-calls': 'error',
      'no-redeclare': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'no-unused-labels': 'error',
      'no-useless-catch': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      'no-unexpected-multiline': 'error',
    },
  },
];
