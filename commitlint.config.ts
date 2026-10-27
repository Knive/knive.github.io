import { RuleConfigSeverity, UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    formatter: '@commitlint/format',
    rules: {
        'type-enum': [
            RuleConfigSeverity.Error,
            'always',
            [
                'tech', // technical tasks in general (tests, documentation, build changes, deployments, refactoring, etc.)
                'feat', // new feature
                'fix', //  to fix a bug
                'hotfix', // to fix a bug in production
                'features-branch' // group of features
            ]
        ],
        'subject-case': [RuleConfigSeverity.Disabled, 'never', 'sentence-case']
    }
};

export default Configuration;
