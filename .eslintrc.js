module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/essential', 'eslint:recommended'],
    rules: {
        semi: ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        indent: ['error', 2],
        'vue/html-indent': 'error',
        quotes: ['error', 'single'],
        'no-debugger': 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
