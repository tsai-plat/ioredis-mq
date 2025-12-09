import type { UserConfig } from '@commitlint/types';
/** @type {import("@commitlint/types").UserConfig} */
const Configuration: UserConfig = {
  'extends': ['@commitlint/config-conventional'],
  'rules': {
    'subject-case': [
      2,
      'always',
      [
        'sentence-case',
        'start-case',
        'pascal-case',
        'upper-case',
        'lower-case',
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'sample',
      ],
    ],
    'subject-empty': [2, 'never'],
  },
  ignores: [
    /** Ignore automatic release messages */
    (commit) => commit.includes('chore(realease):'),
    /** Ignore merge commits */
    (commit) => commit.includes('Merge '),
    /**
     * Ignore long message body lines caused by squash
     * merges with merge commits annotations
     */
    (commit) => commit.includes('(#') && commit.includes(')'),
  ],
};

export default Configuration;
