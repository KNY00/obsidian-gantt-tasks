import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        coverage: {
            provider: 'v8', // or 'istanbul'
            reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
            // Ensures coverage folder is consistently generated and read
            reportsDirectory: './coverage',
            // Prevent Vitest from deleting the coverage folder after tests complete
            clean: false,
            exclude: [
                'node_modules/',
                'dist/',
                'tools/',
                'docs/',
                // add other patterns to exclude
            ],
            enabled: true,
            // Keep reports even if a test fails
            reportOnFailure: true,
        },
    },
});
