module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  // See jest.config.cjs for why this is needed: relative imports under
  // src/server and src/shared now carry explicit `.js` extensions.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}
