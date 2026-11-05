// Lint (npm run lint, also in CI): real mistakes only, no style rules. The game is plain ES modules in the
// browser; tools and tests run in Node (tools also hand functions to the page, so they see browser globals too).
import js from '@eslint/js';
import globals from 'globals';

const rules = {
  ...js.configs.recommended.rules,
  'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^_' }],
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-control-regex': 'off',
  'no-cond-assign': ['error', 'except-parens'],
};

export default [
  { ignores: ['vendor/**', 'node_modules/**', '_site/**', 'dist/**'] },
  { files: ['src/**/*.js'], languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.browser } }, rules },
  { files: ['tools/**/*.{js,mjs}', 'tests/**/*.{js,mjs}', '*.js'], languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node, ...globals.browser } }, rules },
  { files: ['tools/**/*.cjs'], languageOptions: { ecmaVersion: 2024, sourceType: 'commonjs', globals: { ...globals.node } }, rules },
];
