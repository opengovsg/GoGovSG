module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    'node_modules/((@borewit|@tokenizer)/[^/]+|file-type|strtok3|token-types|uint8array-extras)/.+\\.(m)?js$':
      [
        'babel-jest',
        {
          presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        },
      ],
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
  transformIgnorePatterns: [
    '/node_modules/(?!(sanitize-html|htmlparser2|file-type|strtok3|token-types|uint8array-extras|@tokenizer|@borewit)/)',
  ],
}
