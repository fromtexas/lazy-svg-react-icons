const { rules: bestPracticesAirbnbRules } = require('eslint-config-airbnb-base/rules/best-practices');
const { rules: tsAirbnbRules } = require('eslint-config-airbnb-typescript/lib/shared');

/* [start] customized-rules */
const customizedCoreRules = {
  'max-len': 'off',
  'comma-dangle': 'off',

  'no-eval': 'off',
  'arrow-body-style': 'off',
  'arrow-parens': 'off',
  'class-methods-use-this': 'off',
  'consistent-return': 'off',
  curly: ['error', 'all'],
  'function-paren-newline': 'off',
  'implicit-arrow-linebreak': 'off',
  'linebreak-style': 'off',
  'lines-between-class-members': [
    'error',
    'always',
    {
      exceptAfterSingleLine: true,
    },
  ],
  'no-alert': 'error',
  'no-debugger': 'error',
  'no-mixed-operators': 'off',
  'no-param-reassign': 'off',
  'no-plusplus': [
    'error',
    {
      allowForLoopAfterthoughts: true,
    },
  ],
  'no-unused-expressions': 'off',
  'no-unused-vars': 'warn',
  'no-use-before-define': 'off',
  'operator-linebreak': 'off',
  'prefer-destructuring': [
    'error',
    {
      AssignmentExpression: {
        array: false,
        object: false,
      },
      VariableDeclarator: {
        array: false,
        object: true,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  'prefer-template': 'off',
  radix: ['error', 'as-needed'],
};

const customizedImportRules = {
  'import/extensions': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/no-useless-path-segments': [
    'error',
    {
      noUselessIndex: true,
    },
  ],
  'import/prefer-default-export': 'off',
};

/**
 * [TypeScript diagnostic message codes]{@link https://github.com/microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json}
 * @example ts(2451)
 */
const customizedTsRules = {
  '@typescript-eslint/comma-dangle': 'off',
  '@typescript-eslint/brace-style': 'off',
  '@typescript-eslint/comma-spacing': 'off',
  '@typescript-eslint/func-call-spacing': 'off',
  '@typescript-eslint/indent': 'off',
  '@typescript-eslint/keyword-spacing': 'off',
  '@typescript-eslint/no-extra-semi': 'off',
  '@typescript-eslint/semi': 'off',
  '@typescript-eslint/space-before-function-paren': 'off',
  '@typescript-eslint/space-infix-ops': 'off',
  '@typescript-eslint/quotes': 'off',

  'comma-dangle': 'off',
  'lines-between-class-members': 'off',
  '@typescript-eslint/lines-between-class-members': [
    customizedCoreRules['lines-between-class-members'][0],
    customizedCoreRules['lines-between-class-members'][1],
    {
      ...customizedCoreRules['lines-between-class-members'][2],
      exceptAfterOverload: true,
    },
  ],

  '@typescript-eslint/naming-convention': [
    ...tsAirbnbRules['@typescript-eslint/naming-convention'],
    {
      selector: 'enum',
      format: ['PascalCase', 'UPPER_CASE'],
    },
  ],
  '@typescript-eslint/object-curly-spacing': 'off',

  // NOTE: ts(2451)
  '@typescript-eslint/no-redeclare': 'off',

  '@typescript-eslint/no-unnecessary-type-assertion': 'off',

  // NOTE: different name: 'no-return-await' -> 'return-await'
  'no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-expressions': customizedCoreRules['no-unused-expressions'],

  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': customizedCoreRules['no-unused-vars'],

  '@typescript-eslint/return-await': [bestPracticesAirbnbRules['no-return-await'], 'in-try-catch'],

  /**
   * NOTE: rule may produce issues in some cases
   * @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md}
   */
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': customizedCoreRules['no-use-before-define'],

  '@typescript-eslint/member-delimiter-style': 'off',
};
/* [end] customized-rules */

module.exports = {
  root: true,
  env: {
    es2021: true,
    jest: true,
  },
  extends: [
    'prettier',
  ],
  overrides: [
    {
      files: ['./.eslintrc.js'],
      parser: 'espree',
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['./src/**/*.ts', './bin/**/*.ts'],
      extends: ['airbnb-typescript'],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        ...customizedCoreRules,
        ...customizedImportRules,
        ...customizedTsRules,
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  reportUnusedDisableDirectives: true,
  rules: {
    ...customizedCoreRules,
    ...customizedImportRules,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json', '.ts', '.d.ts'],
      },
    },
  },
};
