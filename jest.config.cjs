module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': '@swc/jest',
  },
  // Relative imports under src/server and src/shared now carry explicit
  // `.js` extensions (required by TypeScript's node16/nodenext module
  // resolution). Jest's resolver doesn't map a literal `.js` specifier
  // back to a sibling `.ts`/`.tsx` file on its own, so strip the
  // extension here and let Jest's normal extension resolution take over.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // inversify 8, its @inversifyjs/* dependencies, and nanoid 6 are pure ESM
  // (no CJS build); Jest's default ignores all of node_modules from
  // transformation, so these need to be transformed to CJS like our own
  // source.
  transformIgnorePatterns: [
    '/node_modules/(?!(inversify|@inversifyjs|nanoid)/)',
  ],
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
