import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getInput,
    getFallbackToFileDate,
    getIncludeTags,
    getScheduledPrefix,
    getDuePrefix,
    getCompletionPrefix,
    getIntervalPrefix,
    getExcludeTasksWithoutInterval,
    getTargetLocations,
    getCurrentMdFilePath,
    getStartDate,
} from '@/utils/normalize';
import { getDataviewAPI } from '@/utils/dataview';
import {
    formatDate,
    getCurrentDateString,
    isValidDateObject,
    toDateString,
} from '@/utils/date-conversion';
import { dateFromTaskPath } from '@/utils/string-parsing';

// Mock all external modules to isolate normalize.ts
vi.mock('@/utils/dataview', () => ({
    getDataviewAPI: vi.fn(),
}));

vi.mock('@/utils/date-conversion', () => ({
    formatDate: vi.fn(),
    getCurrentDateString: vi.fn(),
    isValidDateObject: vi.fn(),
    toDateString: vi.fn(),
}));

vi.mock('@/utils/string-parsing', () => ({
    dateFromTaskPath: vi.fn(),
}));

describe('normalize.ts', () => {
    let mockDv: { current: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset global input object
        (globalThis as unknown as { input: Record<string, unknown> }).input = {};

        // Setup default mock dataview object
        mockDv = {
            current: vi.fn().mockReturnValue(undefined),
        };
        vi.mocked(getDataviewAPI).mockReturnValue(
            mockDv as unknown as ReturnType<typeof getDataviewAPI>
        );
    });

    // describe('getInput', () => {
    //     it('should return the global input object', () => {
    //         const expectedInput = { scheduledPrefix: '⏰' };
    //         (globalThis as unknown as { input: Record<string, unknown> }).input = expectedInput;

    //         const result = getInput();
    //         expect(result).toBe(expectedInput);
    //     });
    // });

    describe('getFallbackToFileDate', () => {
        it('should return boolean value when fallbackToFileDate is set in input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                fallbackToFileDate: false,
            };

            const result = getFallbackToFileDate();

            expect(result).toBe(false);
            expect(getDataviewAPI).not.toHaveBeenCalled();
        });

        it('should return true when input is not a boolean and frontmatter fallback_to_file_date is "true"', () => {
            mockDv.current.mockReturnValue({ fallback_to_file_date: '  TRUE  ' });

            const result = getFallbackToFileDate();

            expect(getDataviewAPI).toHaveBeenCalled();
            expect(mockDv.current).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false when input is not a boolean and frontmatter fallback_to_file_date is "false"', () => {
            mockDv.current.mockReturnValue({ fallback_to_file_date: 'false' });

            const result = getFallbackToFileDate();

            expect(result).toBe(false);
        });

        it('should return true as default when input and frontmatter are missing', () => {
            mockDv.current.mockReturnValue(undefined);

            const result = getFallbackToFileDate();

            expect(result).toBe(true);
        });

        it('should return true as default when current page exists but fallback_to_file_date is not a string', () => {
            mockDv.current.mockReturnValue({ fallback_to_file_date: 123 });

            const result = getFallbackToFileDate();

            expect(result).toBe(true);
        });
    });

    describe('getIncludeTags', () => {
        it('should return tag string directly when includeTags is defined in input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                includeTags: '#work',
            };

            const result = getIncludeTags();

            expect(result).toBe('#work');
            expect(getDataviewAPI).not.toHaveBeenCalled();
        });

        it('should return frontmatter include_tags when input is not set', () => {
            mockDv.current.mockReturnValue({ include_tags: '#daily' });

            const result = getIncludeTags();

            expect(result).toBe('#daily');
            expect(getDataviewAPI).toHaveBeenCalled();
        });

        it('should return empty string when neither input nor valid frontmatter is provided', () => {
            mockDv.current.mockReturnValue({ include_tags: 123 });

            const result = getIncludeTags();

            expect(result).toBe('');
        });

        it('should return empty string when dv.current() returns undefined', () => {
            mockDv.current.mockReturnValue(undefined);

            const result = getIncludeTags();

            expect(result).toBe('');
        });
    });

    describe('getScheduledPrefix', () => {
        it('should return configured string prefix from input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                scheduledPrefix: '⏱',
            };

            expect(getScheduledPrefix()).toBe('⏱');
        });

        it('should return default prefix "⏳" when not provided or not a string', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                scheduledPrefix: 123,
            };

            expect(getScheduledPrefix()).toBe('⏳');
        });
    });

    describe('getDuePrefix', () => {
        it('should return configured string prefix from input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                duePrefix: '📌',
            };

            expect(getDuePrefix()).toBe('📌');
        });

        it('should return default prefix "📅" when not provided or not a string', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {};

            expect(getDuePrefix()).toBe('📅');
        });
    });

    describe('getCompletionPrefix', () => {
        it('should return configured string prefix from input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                completionPrefix: 'DONE:',
            };

            expect(getCompletionPrefix()).toBe('DONE:');
        });

        it('should return default prefix "✅" when not provided or not a string', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {};

            expect(getCompletionPrefix()).toBe('✅');
        });
    });

    describe('getIntervalPrefix', () => {
        it('should return configured string prefix from input', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                intervalPrefix: '🕒',
            };

            expect(getIntervalPrefix()).toBe('🕒');
        });

        it('should return default prefix "🪓" when not provided or not a string', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {};

            expect(getIntervalPrefix()).toBe('🪓');
        });
    });

    describe('getExcludeTasksWithoutInterval', () => {
        it('should return input boolean value when excludeTasksWithoutInterval is boolean', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                excludeTasksWithoutInterval: false,
            };

            expect(getExcludeTasksWithoutInterval()).toBe(false);
            expect(getDataviewAPI).not.toHaveBeenCalled();
        });

        it('should parse string boolean from frontmatter exclude_tasks_without_interval correctly', () => {
            mockDv.current.mockReturnValue({ exclude_tasks_without_interval: '  false ' });

            expect(getExcludeTasksWithoutInterval()).toBe(false);
        });

        it('should return true when frontmatter exclude_tasks_without_interval is "true"', () => {
            mockDv.current.mockReturnValue({ exclude_tasks_without_interval: 'true' });

            expect(getExcludeTasksWithoutInterval()).toBe(true);
        });

        it('should return default true when current page is undefined', () => {
            mockDv.current.mockReturnValue(undefined);

            expect(getExcludeTasksWithoutInterval()).toBe(true);
        });

        it('should return default true when frontmatter property is not a string', () => {
            mockDv.current.mockReturnValue({ exclude_tasks_without_interval: 123 });

            expect(getExcludeTasksWithoutInterval()).toBe(true);
        });

        it('should return default true when current page is defined but exclude_tasks_without_interval is undefined', () => {
            // Simulate a defined current page where the frontmatter property is undefined
            mockDv.current.mockReturnValue({
                exclude_tasks_without_interval: undefined,
            });

            const result = getExcludeTasksWithoutInterval();

            expect(getDataviewAPI).toHaveBeenCalled();
            expect(mockDv.current).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('getTargetLocations', () => {
        it('should return input value when includeLocations is provided as a string', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                includeLocations: 'Work/Projects, Journal',
            };

            expect(getTargetLocations()).toBe('Work/Projects, Journal');
            expect(getDataviewAPI).not.toHaveBeenCalled();
        });

        it('should return frontmatter include_locations when input is not defined', () => {
            mockDv.current.mockReturnValue({ include_locations: 'Notes/Tasks' });

            expect(getTargetLocations()).toBe('Notes/Tasks');
        });

        it('should return default "*" when neither input nor valid frontmatter is found', () => {
            mockDv.current.mockReturnValue(undefined);

            expect(getTargetLocations()).toBe('*');
        });

        it('should return default "*" when frontmatter include_locations is not a string', () => {
            mockDv.current.mockReturnValue({ include_locations: null });

            expect(getTargetLocations()).toBe('*');
        });
    });

    describe('getCurrentMdFilePath', () => {
        it('should return file path when current page and path are valid strings', () => {
            mockDv.current.mockReturnValue({ file: { path: 'Folder/Today.md' } });

            const result = getCurrentMdFilePath();

            expect(result).toBe('Folder/Today.md');
            expect(getDataviewAPI).toHaveBeenCalled();
            expect(mockDv.current).toHaveBeenCalled();
        });

        it('should return null when current page has no file property', () => {
            mockDv.current.mockReturnValue({});

            expect(getCurrentMdFilePath()).toBeNull();
        });

        it('should return null when dv.current() returns undefined', () => {
            mockDv.current.mockReturnValue(undefined);

            expect(getCurrentMdFilePath()).toBeNull();
        });

        it('should return null when path is not a string', () => {
            mockDv.current.mockReturnValue({ file: { path: 12345 } });

            expect(getCurrentMdFilePath()).toBeNull();
        });
    });

    describe('getStartDate', () => {
        it('should return formatted date when valid input.startDate is provided', () => {
            const startDate = '2026-09-01';

            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                startDate,
            };
            vi.mocked(toDateString).mockReturnValue(startDate);

            const result = getStartDate();

            expect(toDateString).toHaveBeenCalledWith(startDate);
            expect(result).toBe(startDate);
        });

        it('should proceed to frontmatter check when input.startDate cannot be converted to a valid date', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                startDate: 'invalid-date',
            };
            vi.mocked(toDateString).mockReturnValue(null);

            const mockDateObj = { year: 2026, month: 9, day: 1 };
            mockDv.current.mockReturnValue({ start_date: mockDateObj });
            vi.mocked(isValidDateObject).mockReturnValue(true);
            vi.mocked(formatDate).mockReturnValue('2026-09-01');

            const result = getStartDate();

            expect(toDateString).toHaveBeenCalledWith('invalid-date');
            expect(isValidDateObject).toHaveBeenCalledWith(mockDateObj);
            expect(formatDate).toHaveBeenCalledWith(2026, 9, 1);
            expect(result).toBe('2026-09-01');
        });

        it('should return formatted frontmatter date when input.startDate is not set and frontmatter has valid start_date', () => {
            const mockDateObj = { year: 2026, month: 12, day: 25 };
            mockDv.current.mockReturnValue({ start_date: mockDateObj });
            vi.mocked(isValidDateObject).mockReturnValue(true);
            vi.mocked(formatDate).mockReturnValue('2026-12-25');

            const result = getStartDate();

            expect(isValidDateObject).toHaveBeenCalledWith(mockDateObj);
            expect(formatDate).toHaveBeenCalledWith(2026, 12, 25);
            expect(result).toBe('2026-12-25');
        });

        it('should fallback to filename date when fallbackToFileDate is enabled and frontmatter start_date is invalid', () => {
            mockDv.current.mockReturnValue({
                file: { path: 'Journal/2026-08-15.md' },
                start_date: 'not-an-object',
            });
            vi.mocked(isValidDateObject).mockReturnValue(false);
            vi.mocked(dateFromTaskPath).mockReturnValue('2026-08-15');

            const result = getStartDate();

            expect(dateFromTaskPath).toHaveBeenCalledWith('Journal/2026-08-15.md');
            expect(result).toBe('2026-08-15');
        });

        it('should fallback to current date string when fallbackToFileDate is disabled', () => {
            (globalThis as unknown as { input: Record<string, unknown> }).input = {
                fallbackToFileDate: false,
            };
            mockDv.current.mockReturnValue(undefined);
            vi.mocked(getCurrentDateString).mockReturnValue('2026-09-01');

            const result = getStartDate();

            expect(dateFromTaskPath).not.toHaveBeenCalled();
            expect(getCurrentDateString).toHaveBeenCalled();
            expect(result).toBe('2026-09-01');
        });

        it('should fallback to current date string when filename parsing returns null', () => {
            mockDv.current.mockReturnValue({
                file: { path: 'Journal/RandomName.md' },
            });
            vi.mocked(dateFromTaskPath).mockReturnValue(null);
            vi.mocked(getCurrentDateString).mockReturnValue('2026-09-01');

            const result = getStartDate();

            expect(getCurrentDateString).toHaveBeenCalled();
            expect(result).toBe('2026-09-01');
        });

        it('should fallback to current date string when currentMdFilePath is null', () => {
            mockDv.current.mockReturnValue(undefined);
            vi.mocked(getCurrentDateString).mockReturnValue('2026-09-01');

            const result = getStartDate();

            expect(getCurrentDateString).toHaveBeenCalled();
            expect(result).toBe('2026-09-01');
        });
    });
});
