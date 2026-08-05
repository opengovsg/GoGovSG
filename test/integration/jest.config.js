module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setup.ts'],
  globalSetup: '<rootDir>/globalSetup.ts',
}
