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
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
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
