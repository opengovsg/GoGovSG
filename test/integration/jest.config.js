/* eslint-env node */
const { File } = require('node:buffer')

if (typeof global.File === 'undefined') {
  global.File = File
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setup.ts'],
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
  transformIgnorePatterns: [
    '/node_modules/(?!(sanitize-html|htmlparser2|file-type|strtok3|token-types|uint8array-extras|@tokenizer|@borewit)/)',
  ],
}
