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
  // Jest 26 does not resolve package.json "exports"; map CJS entry points explicitly.
  moduleNameMapper: {
    '^@opengovsg/validators/email$':
      '<rootDir>/node_modules/@opengovsg/validators/dist/email/index.js',
    '^zod/v4/core$': '<rootDir>/node_modules/zod/v4/core/index.cjs',
    '^zod/v4$': '<rootDir>/node_modules/zod/v4/index.cjs',
  },
}
