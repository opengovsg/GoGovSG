module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'always', ['pascal-case', 'lower-case', 'camel-case']],
  },
}
