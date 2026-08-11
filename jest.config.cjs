module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  // Relative imports under src/server and src/shared now carry explicit
  // `.js` extensions (required by TypeScript's node16/nodenext module
  // resolution). Jest's resolver doesn't map a literal `.js` specifier
  // back to a sibling `.ts`/`.tsx` file on its own, so strip the
  // extension here and let Jest's normal extension resolution take over.
  // Jest 26 does not resolve package.json "exports"; map CJS entry points explicitly.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@opengovsg/validators/email$':
      '<rootDir>/node_modules/@opengovsg/validators/dist/email/index.js',
    '^zod/v4/core$': '<rootDir>/node_modules/zod/v4/core/index.cjs',
    '^zod/v4$': '<rootDir>/node_modules/zod/v4/index.cjs',
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
}
