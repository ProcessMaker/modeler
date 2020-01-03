module.exports = {
  plugins: [
    'cypress',
  ],
  env: {
    mocha: true,
    'cypress/globals': true,
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
  ],
  rules: {
    strict: 'off',
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'vue/html-indent': 'error',
    quotes: ['error', 'single'],
    'no-debugger': 'off',
    'object-shorthand': 'error',
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': 'error',
    'prefer-arrow-callback': 'error',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
