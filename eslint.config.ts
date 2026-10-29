import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
    globalIgnores(['dist', 'tmp', '.playwright-cli']),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended', eslintConfigPrettier],
        languageOptions: { globals: globals.browser }
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        // 'detect' crashes on ESLint 10 (eslint-plugin-react 7.37 calls the removed context.getFilename)
        settings: { react: { version: '19.2' } },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/no-unknown-property': 'off',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['*.css'],
                            message:
                                'Only src/main.tsx imports CSS (global.css). Style with Tailwind utilities.'
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['src/main.tsx'],
        rules: { 'no-restricted-imports': 'off' }
    }
]);
