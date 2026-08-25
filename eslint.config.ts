import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.recommended,
    prettierConfig,
    {
        plugins: {
            prettier: prettierPlugin,
        },
        files: ['**/*.{ts,tsx,js,mjs}'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'prettier/prettier': 'error',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', 'build/**'],
    }
);
