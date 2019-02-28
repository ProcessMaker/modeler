module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
  ],
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    'no-debugger': 'off',
    'object-shorthand': 'error',
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': 'error',
    'vue/html-indent': ['error', 2, { alignAttributesVertically: false }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always',
    }],
    'vue/html-self-closing': 'error',
    'vue/mustache-interpolation-spacing': 'error',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
