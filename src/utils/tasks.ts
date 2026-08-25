import { buildTask } from './ui';
import { hasAllTags, removeTags } from './tags';
import {
    getCompletionPrefix,
    getDuePrefix,
    getFallbackToFileDate,
    getIncludeTags,
    getIntervalPrefix,
    getScheduledPrefix,
} from './normalize';
import { TaskItem } from '@/types';

/**
 * Extracts and parses task items from an array of markdown lines.
 *
 * Filters lines to find valid markdown tasks (`- [ ]` or `- [x]`) that match
 * the specified tag criteria, then constructs structured task objects using
 * configured prefix symbols.
 *
 * @param filePath
 * @param lines - An array of raw markdown text lines from a file.
 * @returns An array of parsed `TaskItem` objects.
 */
export function extractTasks(filePath: string, lines: string[]) {
    const includeTags: string = getIncludeTags();
    const fallbackToFileDate = getFallbackToFileDate();
    const scheduledPrefix: string = getScheduledPrefix();
    const duePrefix: string = getDuePrefix();
    const completionPrefix: string = getCompletionPrefix();
    const intervalPrefix: string = getIntervalPrefix();

    const outputBlocks: TaskItem[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!(line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]'))) {
            continue;
        }

        if (hasAllTags(line, includeTags) || includeTags.length == 0) {
            const firstLine = removeTags(line, includeTags);

            const task = buildTask(
                firstLine,
                scheduledPrefix,
                duePrefix,
                completionPrefix,
                intervalPrefix,
                filePath,
                fallbackToFileDate
            );

            outputBlocks.push(task);
        }
    }

    return outputBlocks;
}
