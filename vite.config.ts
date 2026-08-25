import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const entryPath = 'src/timeline.ts';
    const outputName = 'timeline.js';

    return {
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        build: {
            outDir: 'dist',
            // Clean the dist folder only on the first build (memo) to prevent deleting files
            emptyOutDir: true,
            lib: {
                entry: resolve(__dirname, entryPath),
                formats: ['cjs'],
                fileName: () => outputName,
            },
            rollupOptions: {
                external: ['obsidian', 'luxon'],
            },
            minify: mode === 'production' ? true : false,
        },
    };
});
