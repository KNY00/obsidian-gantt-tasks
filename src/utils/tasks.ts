import { type TFile } from 'obsidian';
import type { TaskItem } from '@/types';
import { buildTask } from './ui';
import { hasAllTags, removeTags } from './tags';
import {
    getCompletionPrefix,
    getDuePrefix,
    getExcludeTasksWithoutInterval,
    getFallbackToFileDate,
    getIncludeTags,
    getIntervalPrefix,
    getScheduledPrefix,
    getStartDate,
    getTargetLocations,
} from './normalize';
import { isFileMatchingLocation } from './path';
import { getDataviewAPI } from './dataview';
import { getFilteredTasks, sortTasks } from './filter';
import { getStartDateWithOffset } from './date-conversion';

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
        const lim = line.trim();

        if (!(lim.startsWith('- [ ]') || lim.startsWith('- [x]') || lim.startsWith('- [X]'))) {
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

export const fetchAllTasks = async () => {
    const dv = getDataviewAPI();
    // Retrieve all pages in the vault
    const pages = dv.pages();

    const locations = getTargetLocations();

    const globalTasks: TaskItem[] = [];

    // Iterate through each page
    for (const page of pages) {
        // Ignore files that contain the variable 'dataview' in their frontmatter
        if (page.dataview !== undefined) {
            continue;
        }

        if (!isFileMatchingLocation(page.file, locations)) continue;

        // Retrieve the actual file object
        const tFile = app.vault.getAbstractFileByPath(page.file.path);

        if (!tFile) continue;

        // Read the raw text content of the file using .then() instead of await
        const content = await app.vault.read(tFile as TFile);
        const lines = content.split('\n');

        // Generate the output blocks using the external function
        // Passing the page path so we can generate internal links to the exact line
        const tasks = extractTasks(page.file.path, lines);

        globalTasks.push(...tasks);
    }

    return globalTasks;
};

interface ResolvedTimelineData {
    filterDate: string | null;
    tasks: TaskItem[];
}

/**
 * Computes the date offset, filters and sorts tasks for the timeline view,W
 * and returns the active filter date along with the processed tasks.
 *
 * @param globalTasks - All parsed tasks from the vault.
 * @returns The resolved filter date and the filtered/sorted task list.
 */
export function resolveTimelineTasks(globalTasks: TaskItem[]): ResolvedTimelineData {
    const filterDate = getStartDateWithOffset(getStartDate());
    const excludeTasksWithoutInterval = getExcludeTasksWithoutInterval();

    const filteredTasks = getFilteredTasks(globalTasks, filterDate, excludeTasksWithoutInterval);

    sortTasks(filteredTasks);

    return {
        filterDate,
        tasks: filteredTasks,
    };
}
