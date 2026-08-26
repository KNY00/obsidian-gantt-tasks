// * Used for timeline

/**
 * Parses a comma-separated string of tags into an array of individual tag strings.
 * Trims whitespace from each extracted tag.
 *
 * @param {string} tagStr - A string containing one or more tags, separated by commas.
 * @returns {string[]} An array of trimmed tag strings.
 */
const tagStringToArray = (tagStr: string): string[] => {
    const match = tagStr.match(/,/g);

    if (match !== null && match.length > 0) {
        return tagStr.split(',').map((tag) => tag.trim());
    }

    return [tagStr];
};

/**
 * Checks if a given line of text contains the specified tags.
 *
 * @param {string} line - The string of text to search within.
 * @param {string} tagStr - A comma-separated string of tags to look for.
 * @returns {boolean} Returns true if the condition passes.
 */
export const hasAllTags = (line: string, tagStr: string): boolean => {
    const tags = tagStringToArray(tagStr);

    for (const tag of tags) {
        if (!line.includes(tag)) {
            return false;
        }
    }

    return true;
};

/**
 * Removes occurrences of the global `targetTag` from a given line of text.
 *
 * @param {string} line - The string of text to modify.
 * @param {string} tagStr - A comma-separated string of tags determining the iteration count.
 * @returns {string} The modified string with the target tag removed.
 */
export const removeTags = (line: string, tagStr: string): string => {
    const arr = tagStringToArray(tagStr);

    let modifiedLine = line;

    arr.forEach((tag) => {
        modifiedLine = modifiedLine.replace(tag, '').trimEnd();
    });

    return modifiedLine;
};
