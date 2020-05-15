module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 10,
    },
  },
  collectCoverageFrom: ['./src/server/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['./node_modules/', './test/'],
  coverageReporters: [],
}
