module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },

  extends: ["plugin:vue/recommended", "airbnb-base", "eslint:recommended", "@vue/prettier", "@vue/airbnb", "plugin:prettier/recommended"],

  parserOptions: {
    ecmaVersion: "6",
    sourceType: "module",
    parser: "babel-eslint"
  },

  plugins: ["vue", "prettier"],

  rules: {
    "prettier/prettier": ["error", { trailingComma: "none" }],
    "no-unexpected-multiline": "error",
    "no-param-reassign": 1,
    eqeqeq: "error",
    "max-len": ["error", { code: 140, ignoreUrls: true }],
    "comma-dangle": ["error", "never"],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  },

  root: true,

  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
      env: {
        jest: true
      }
    }
  ]
};
