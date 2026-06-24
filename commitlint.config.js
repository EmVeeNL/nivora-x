export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Keep the allowed types in sync with CONTRIBUTING.md
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [0], // Don't enforce subject case
  },
}
