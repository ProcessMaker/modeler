module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest',
    '\\.svg$': '<rootDir>/fileTransformer.js',
    '\\.yml$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: [
    '/node_modules/((?!@fortawesome).)*/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^js-yaml-loader\\!@fortawesome/(.*)\\.yml$': '<rootDir>/node_modules/@fortawesome/$1.yml',
  },
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
};
