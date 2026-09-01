import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFileMatchingLocation, _testing } from '@/utils/path';
import { getCurrentMdFilePath } from '@/utils/normalize';

// Mock getCurrentMdFilePath to ensure isolated unit tests
vi.mock('@/utils/normalize', () => ({
    getCurrentMdFilePath: vi.fn(),
}));

describe('path utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('normalizePath', () => {
        it('should return an empty string for non-string inputs', () => {
            expect(_testing!.normalizePath(null as unknown as string)).toBe('');
            expect(_testing!.normalizePath(undefined as unknown as string)).toBe('');
            expect(_testing!.normalizePath(123 as unknown as string)).toBe('');
        });

        it('should trim surrounding whitespace', () => {
            expect(_testing!.normalizePath('   folder/file.md   ')).toBe('folder/file.md');
        });

        it('should convert Windows backslashes to forward slashes', () => {
            expect(_testing!.normalizePath('folder\\subfolder\\file.md')).toBe(
                'folder/subfolder/file.md'
            );
        });

        it('should collapse multiple consecutive slashes into a single slash', () => {
            expect(_testing!.normalizePath('folder///subfolder//file.md')).toBe(
                'folder/subfolder/file.md'
            );
        });

        it('should remove leading and trailing slashes', () => {
            expect(_testing!.normalizePath('/folder/subfolder/')).toBe('folder/subfolder');
            expect(_testing!.normalizePath('///folder/file.md///')).toBe('folder/file.md');
        });

        it('should return an empty string if path consists only of slashes and spaces', () => {
            expect(_testing!.normalizePath('   ///   ')).toBe('');
        });
    });

    describe('arePathsEqual', () => {
        it('should return false if either path is null, undefined, or empty', () => {
            expect(_testing!.arePathsEqual(null, 'folder/file.md')).toBe(false);
            expect(_testing!.arePathsEqual('folder/file.md', null)).toBe(false);
            expect(_testing!.arePathsEqual(undefined, 'folder/file.md')).toBe(false);
            expect(_testing!.arePathsEqual('folder/file.md', undefined)).toBe(false);
            expect(_testing!.arePathsEqual('', 'folder/file.md')).toBe(false);
            expect(_testing!.arePathsEqual('   ', 'folder/file.md')).toBe(false);
            expect(_testing!.arePathsEqual('///', '///')).toBe(false);
        });

        it('should return true for identical paths after normalization', () => {
            expect(_testing!.arePathsEqual('folder/file.md', 'folder/file.md')).toBe(true);
            expect(_testing!.arePathsEqual('/folder/file.md', 'folder/file.md/')).toBe(true);
            expect(_testing!.arePathsEqual('folder\\file.md', 'folder/file.md')).toBe(true);
        });

        it('should be case-insensitive by default', () => {
            expect(_testing!.arePathsEqual('Folder/File.md', 'folder/file.md')).toBe(true);
            expect(_testing!.arePathsEqual('FOLDER/FILE.MD', 'folder/file.md', true)).toBe(true);
        });

        it('should respect case sensitivity when caseInsensitive is set to false', () => {
            expect(_testing!.arePathsEqual('Folder/File.md', 'folder/file.md', false)).toBe(false);
            expect(_testing!.arePathsEqual('folder/file.md', 'folder/file.md', false)).toBe(true);
        });

        it('should return false for distinct paths', () => {
            expect(_testing!.arePathsEqual('folder1/file.md', 'folder2/file.md')).toBe(false);
        });
    });

    describe('isFileMatchingLocation', () => {
        it('should return true when location is the wildcard "*"', () => {
            const file = { path: 'any/folder/file.md' };
            expect(isFileMatchingLocation(file, '*')).toBe(true);
        });

        it('should default location to "Journal" when not provided', () => {
            const matchingFile = { path: 'Journal/2026-09-01.md' };
            const nonMatchingFile = { path: 'Projects/2026-09-01.md' };

            expect(isFileMatchingLocation(matchingFile)).toBe(true);
            expect(isFileMatchingLocation(nonMatchingFile)).toBe(false);
        });

        it('should correctly resolve filePath from file.path or file.file.path', () => {
            const directPathObj = { path: 'Journal/note.md' };
            const nestedPathObj = { file: { path: 'Journal/note.md' } };

            expect(isFileMatchingLocation(directPathObj, 'Journal')).toBe(true);
            expect(isFileMatchingLocation(nestedPathObj, 'Journal')).toBe(true);
        });

        it('should match current file when location is "@currentFile"', () => {
            vi.mocked(getCurrentMdFilePath).mockReturnValue('Journal/Today.md');

            const matchingFile = { path: 'Journal/Today.md' };
            const nonMatchingFile = { path: 'Journal/Yesterday.md' };

            expect(isFileMatchingLocation(matchingFile, '@currentFile')).toBe(true);
            expect(isFileMatchingLocation(nonMatchingFile, '@currentFile')).toBe(false);
        });

        it('should handle Windows backslashes in filePath when checking folder hierarchy', () => {
            const file = { path: 'Journal\\Daily\\2026-09-01.md' };
            expect(isFileMatchingLocation(file, 'Journal')).toBe(true);
            expect(isFileMatchingLocation(file, 'Daily')).toBe(true);
        });

        it('should match paths that start with folder or have folder as an intermediate segment', () => {
            const rootFile = { path: 'Work/Tasks.md' };
            const nestedFile = { path: 'Archive/Work/OldTasks.md' };
            const partialNameFile = { path: 'Workspace/Tasks.md' };

            expect(isFileMatchingLocation(rootFile, 'Work')).toBe(true);
            expect(isFileMatchingLocation(nestedFile, 'Work')).toBe(true);
            // Should not match "Workspace" when targeting "Work"
            expect(isFileMatchingLocation(partialNameFile, 'Work')).toBe(false);
        });

        it('should handle comma-separated target locations with whitespace trimming', () => {
            const locations = 'Journal, Work, Projects/Current';

            expect(isFileMatchingLocation({ path: 'Journal/note.md' }, locations)).toBe(true);
            expect(isFileMatchingLocation({ path: 'Work/note.md' }, locations)).toBe(true);
            expect(isFileMatchingLocation({ path: 'Projects/Current/note.md' }, locations)).toBe(
                true
            );
            expect(isFileMatchingLocation({ path: 'Personal/note.md' }, locations)).toBe(false);
        });

        it('should return false if file has no valid path properties', () => {
            const emptyFile = {};
            expect(isFileMatchingLocation(emptyFile, 'Journal')).toBe(false);
        });
    });
});
