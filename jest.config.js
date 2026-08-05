module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  coverageThreshold: {
    global: {
      statements: 24,
    },
  },
  collectCoverageFrom: ['./src/server/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['./node_modules/', './test/', '__tests__'],
  setupFiles: ['./test/server/setup.ts'],
  modulePathIgnorePatterns: ['./test/end-to-end', './test/integration'],
  transformIgnorePatterns: ['/node_modules/(?!(sanitize-html|htmlparser2)/)'],
}
