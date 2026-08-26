// Import the actual types from the downloaded dataview package
import { type DataviewInlineApi } from 'obsidian-dataview/lib/api/inline-api';
import { type App } from 'obsidian';
import { Mermaid } from 'mermaid';

declare global {
    const dv: DataviewInlineApi;
    const app: App;
    const mermaid: Mermaid;

    const input: {
        scheduledPrefix?: string;
        duePrefix?: string;
        completionPrefix?: string;
        intervalPrefix?: string;
        includeTags?: string;
        includeLocations?: string;
        fallbackToFileDate?: boolean;
        excludeTasksWithoutInterval?: boolean;
        startDate?: string;
    };
}
