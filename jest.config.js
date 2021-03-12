module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 24,
    },
  },
  collectCoverageFrom: ['./src/server/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['./node_modules/', './test/', '__tests__'],
  setupFiles: ['./test/server/setup.ts'],
  modulePathIgnorePatterns: ['./test/end-to-end'],
}
