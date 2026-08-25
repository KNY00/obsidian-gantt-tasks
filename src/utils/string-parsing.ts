import { toDateString } from './date-conversion';

/**
 * Extracts the first whitespace-delimited word or value immediately following a given prefix in a string.
 *
 * For example, given `extractDataAfterPrefix("🚨 completed now", "🚨")`,
 * it will return `"completed"`.
 *
 * @param sourceString - The source string to search within.
 * @param prefix - The prefix keyword or symbol to look for.
 * @returns The extracted data string, or `null` if the prefix is not found.
 */
export function extractTokenAfterPrefix(sourceString: string, prefix: string) {
    const prefixIndex = sourceString.indexOf(prefix);

    if (prefixIndex >= 0) {
        let hasFoundValue = false;
        let extractedValue = '';

        for (let x = prefixIndex + prefix.length + 1; x < sourceString.length; x += 1) {
            if (sourceString[x] === ' ' && !hasFoundValue) continue;

            if (sourceString[x] !== ' ') {
                hasFoundValue = true;
                extractedValue += sourceString[x];
            }

            if (sourceString[x] === ' ' && hasFoundValue) {
                break;
            }
        }

        return extractedValue.trim();
    }

    return null;
}

/**
 * Extracts the file name (without path and extension) from a given file path.
 *
 * @param filePath - The full path of the file (e.g., "journal/2023-10-25.md")
 * @returns The file title/name without extension (e.g., "2023-10-25")
 */
export function getFileTitle(filePath: string): string | null {
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Get the last segment (file name with extension)
    const fileNameWithExt = normalizedPath.split('/').pop() || '';

    if (fileNameWithExt.length == 0) {
        return null;
    }

    // Remove the file extension (e.g., .md)
    const lastDotIndex = fileNameWithExt.lastIndexOf('.');

    return lastDotIndex !== -1 ? fileNameWithExt.substring(0, lastDotIndex) : fileNameWithExt;
}

/**
 * Extracts the file name from a given path, attempts to convert it into a valid "YYYY-MM-DD" date string,
 * or returns null if the conversion fails or the file name is not a valid date.
 *
 * @param filePath - The full file path.
 * @returns The formatted date string, or null.
 */
export function dateFromTaskPath(filePath: string): string | null {
    const fileName = getFileTitle(filePath);
    return toDateString(fileName);
}
