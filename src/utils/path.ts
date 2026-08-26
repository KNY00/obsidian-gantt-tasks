import { getCurrentMdFilePath } from './normalize';

/**
 * Normalizes a file path by standardizing slashes, trimming whitespace,
 * and removing duplicate or leading/trailing slashes.
 */
export function normalizePath(filePath: string): string {
    if (typeof filePath !== 'string') {
        return '';
    }

    return filePath
        .trim()
        .replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
        .replace(/\/+/g, '/') // Collapse multiple slashes (e.g., folder//file -> folder/file)
        .replace(/^\/+/, '') // Remove leading slash
        .replace(/\/+$/, ''); // Remove trailing slash
}

/**
 * Checks if two file paths are the same, handling slashes, whitespace,
 * and optional case-insensitivity.
 *
 * @param pathA - First file path
 * @param pathB - Second file path
 * @param [caseInsensitive=true] - Whether the comparison should ignore case
 * @returns True if both paths point to the same location, false otherwise.
 */
export function arePathsEqual(
    pathA: string | null | undefined,
    pathB: string | null | undefined,
    caseInsensitive = true
): boolean {
    if (!pathA || !pathB) {
        return false;
    }

    const normalizedA = normalizePath(pathA);
    const normalizedB = normalizePath(pathB);

    if (normalizedA === '' || normalizedB === '') {
        return false;
    }

    if (caseInsensitive) {
        return normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }

    return normalizedA === normalizedB;
}

type FileWithPath = { path?: string; file?: { path: string } };

/**
 * Checks if a given file matches a location criteria (supports '*', '@currentFile', comma-separated paths, or folder hierarchies).
 *
 * @template T - A file type that includes a path property.
 * @param file - The file object to check.
 * @param [location='Journal'] - The target location, comma-separated paths, '@currentFile', or '*'.
 * @returns True if the file matches the location criteria, false otherwise.
 */
export function isTaskMatchingLocation<T extends FileWithPath>(
    file: T,
    location: string = 'Journal'
): boolean {
    if (location === '*') {
        return true;
    }

    const filePath = file.path || file.file?.path || '';

    if (location === '@currentFile') {
        const currentPath = getCurrentMdFilePath();

        return arePathsEqual(filePath, currentPath);
    }

    const normalizedPath = filePath.replace(/\\/g, '/');

    const folders = location.split(',').map((f) => f.trim());

    return folders.some(
        (folder) =>
            normalizedPath.startsWith(folder + '/') || normalizedPath.includes(`/${folder}/`)
    );
}
