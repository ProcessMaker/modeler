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
    "object-shorthand": "error",
    "space-before-function-paren": ["error", "never"],
    "keyword-spacing": "error",
    "no-param-reassign": "warn",
    "prettier/prettier": ["error", { trailingComma: "none" }],
    "no-unexpected-multiline": "error",
    eqeqeq: "error",
    "max-len": ["error", { code: 140, ignoreUrls: true }],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "import/no-extraneous-dependencies": "warn",
    "consistent-return": "warn",
    "no-plusplus": 0,
    "no-underscore-dangle": 0,
    "no-restricted-syntax": "warn",
    "no-continue": "warn",
    "prefer-destructuring": "warn",
    "import/no-cycle": "warn",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  },
  parserOptions: {
    ecmaVersion: "6",
    sourceType: "module",
    parser: "babel-eslint"
  }
};
