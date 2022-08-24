module.exports = {
  plugins: ["vue", "prettier", "cypress"],
  env: {
    mocha: true,
    "cypress/globals": true,
    node: true
  },
  extends: ["plugin:vue/recommended", "airbnb-base", "eslint:recommended", "@vue/prettier", "@vue/airbnb", "plugin:prettier/recommended"],
  rules: {
    "comma-dangle": ["error", "only-multiline"],
    indent: ["error", 2, { SwitchCase: 1 }],
    "vue/html-indent": "error",
    "no-debugger": "off",
    "object-shorthand": "error",
    "space-before-function-paren": ["error", "never"],
    "keyword-spacing": "error"
  },
  parserOptions: {
    ecmaVersion: "6",
    sourceType: "module",
    parser: "babel-eslint"
  }
};
