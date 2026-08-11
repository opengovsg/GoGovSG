module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': '@swc/jest',
  },
  // See jest.config.cjs for why this is needed: relative imports under
  // src/server and src/shared now carry explicit `.js` extensions.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // nanoid 6 is pure ESM (no CJS build); see jest.config.cjs for details.
  transformIgnorePatterns: ['/node_modules/(?!(nanoid)/)'],
}
