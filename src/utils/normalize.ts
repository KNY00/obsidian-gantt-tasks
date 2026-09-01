import { getDataviewAPI } from './dataview';
import {
    formatDate,
    getCurrentDateString,
    isValidDateObject,
    toDateString,
} from './date-conversion';
import { dateFromTaskPath } from './string-parsing';

/* v8 ignore start */
export function getInput() {
    return input;
}
/* v8 ignore stop */

/**
 * Normalizes the fallbackToFileDate option from user input.
 * Ensures it evaluates safely to a boolean, defaulting to false if not provided or invalid.
 */
export function getFallbackToFileDate(): boolean {
    const fb = getInput().fallbackToFileDate;

    if (typeof fb === 'boolean') {
        return fb;
    }

    // md property
    const dv = getDataviewAPI();
    const current = dv.current();

    if (typeof current !== 'undefined') {
        if (typeof current.fallback_to_file_date === 'string') {
            return current.fallback_to_file_date.trim().toLowerCase() === 'true';
        }
    }

    return true;
}

/**
 * Normalizes the includeTags option from user input.
 * Ensures it evaluates safely to a string, defaulting to an empty string if not provided or invalid.
 */
export function getIncludeTags(): string {
    const tags = getInput().includeTags;

    if (typeof tags === 'string') {
        return tags;
    }

    // md property
    const dv = getDataviewAPI();
    const current = dv.current();

    if (typeof current !== 'undefined') {
        if (typeof current.include_tags === 'string') {
            return current.include_tags;
        }
    }

    return '';
}

/**
 * Normalizes the scheduledPrefix option from user input.
 * Ensures it evaluates safely to a string, defaulting to '⏳' if not provided or invalid.
 */
export function getScheduledPrefix(): string {
    const prefix = getInput().scheduledPrefix;
    return typeof prefix === 'string' ? prefix : '⏳';
}

/**
 * Normalizes the duePrefix option from user input.
 * Ensures it evaluates safely to a string, defaulting to '📅' if not provided or invalid.
 */
export function getDuePrefix(): string {
    const prefix = getInput().duePrefix;
    return typeof prefix === 'string' ? prefix : '📅';
}

/**
 * Normalizes the completionPrefix option from user input.
 * Ensures it evaluates safely to a string, defaulting to '✅' if not provided or invalid.
 */
export function getCompletionPrefix(): string {
    const prefix = getInput().completionPrefix;
    return typeof prefix === 'string' ? prefix : '✅';
}

/**
 * Normalizes the intervalPrefix option from user input.
 * Ensures it evaluates safely to a string, defaulting to '🪓' if not provided or invalid.
 */
export function getIntervalPrefix(): string {
    const prefix = getInput().intervalPrefix;
    return typeof prefix === 'string' ? prefix : '🪓';
}

/**
 * Normalizes the excludeTasksWithoutInterval option from user input.
 * Ensures it evaluates safely to a boolean, defaulting to true if not provided or invalid.
 */
export function getExcludeTasksWithoutInterval(): boolean {
    const exclude = getInput().excludeTasksWithoutInterval;

    if (typeof exclude === 'boolean') {
        return exclude;
    }

    // md property
    const dv = getDataviewAPI();
    const current = dv.current();

    if (typeof current !== 'undefined') {
        if (typeof current.exclude_tasks_without_interval !== 'undefined') {
            const exclusion = current.exclude_tasks_without_interval;

            if (typeof exclusion === 'string') {
                return exclusion.trim().toLowerCase() === 'true';
            }
        }
    }

    // default
    return true;
}

/**
 * Normalizes the includeLocations option from user input.
 * Ensures it evaluates safely to a string, defaulting to '*' if not provided or invalid.
 */
export function getTargetLocations(): string {
    const folders = getInput().includeLocations;

    if (typeof folders === 'string') {
        return folders;
    }

    const dv = getDataviewAPI();
    const current = dv.current();

    if (typeof current !== 'undefined') {
        if (typeof current.include_locations === 'string') {
            return current.include_locations;
        }
    }

    return '*';
}

/**
 * Gets the file path of the current Markdown note using the Dataview API.
 * Returns null if the path cannot be determined or is not a string.
 */
export function getCurrentMdFilePath() {
    const dv = getDataviewAPI();
    const current = dv.current();
    const currentPath = current?.file?.path;

    if (typeof currentPath === 'string') {
        return currentPath;
    }

    return null;
}

/**
 * Determines the effective start date for filtering tasks.
 *
 * It checks three hierarchical sources in order:
 * 1. **Script Input (`input.startDate`)**: Checks parameters passed directly to the Dataview JS query.
 * 2. **Frontmatter Property (`current.start_date`)**: Checks the current page's frontmatter for a valid date object (e.g., Luxon or Dataview date).
 * 3. **Filename Fallback**: If enabled (`getFallbackToFileDate()`), attempts to parse a date string out of the current markdown file's name/path.
 *
 * @returns {string | null} The formatted date string (e.g., 'YYYY-MM-DD') or `null` if no start date can be resolved.
 */
export function getStartDate() {
    const sd = getInput().startDate;

    // script property
    if (typeof sd !== 'undefined') {
        const dateString = toDateString(sd);

        if (dateString !== null) {
            return dateString;
        }
    }

    // md property
    const dv = getDataviewAPI();
    const current = dv.current();

    if (typeof current !== 'undefined') {
        if (typeof current.start_date !== 'undefined') {
            // TODO: check if it's luxon instance
            const startDate = current.start_date;

            const result = isValidDateObject(startDate);

            if (result) {
                const { year, month, day } = startDate;

                return formatDate(year, month, day);
            }
        }
    }

    // fileName
    if (getFallbackToFileDate()) {
        const currentPath = getCurrentMdFilePath();

        if (currentPath !== null) {
            const filenameDate = dateFromTaskPath(currentPath);

            if (filenameDate !== null) {
                return filenameDate;
            }
        }
    }

    return getCurrentDateString();
}
