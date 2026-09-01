import { describe, it, expect, vi, beforeEach } from 'vitest'; // or from '@jest/globals'
import { extractTasks } from '@/utils/tasks';
import { buildTask } from '@/utils/ui';
import { hasAllTags, removeTags } from '@/utils/tags';
import {
    getCompletionPrefix,
    getDuePrefix,
    getFallbackToFileDate,
    getIncludeTags,
    getIntervalPrefix,
    getScheduledPrefix,
} from '@/utils/normalize';
import type { TaskItem } from '@/types';

vi.mock('@/utils/ui', () => ({
    buildTask: vi.fn(),
}));

vi.mock('@/utils/tags', () => ({
    hasAllTags: vi.fn(),
    removeTags: vi.fn(),
}));

vi.mock('@/utils/normalize', () => ({
    getCompletionPrefix: vi.fn(),
    getDuePrefix: vi.fn(),
    getFallbackToFileDate: vi.fn(),
    getIncludeTags: vi.fn(),
    getIntervalPrefix: vi.fn(),
    getScheduledPrefix: vi.fn(),
}));

describe('extractTasks', () => {
    const mockFilePath = 'journals/2026-09-01.md';

    const createDummyTask = (name: string): TaskItem => ({
        name,
        fileNameDate: '2026-09-01',
        scheduledDate: null,
        dueDate: null,
        completionDate: null,
        startTime: null,
        endTime: null,
        status: 'active',
        isDisplayable: true,
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations for normalization settings
        vi.mocked(getIncludeTags).mockReturnValue('');
        vi.mocked(getFallbackToFileDate).mockReturnValue(true);
        vi.mocked(getScheduledPrefix).mockReturnValue('⏳');
        vi.mocked(getDuePrefix).mockReturnValue('📅');
        vi.mocked(getCompletionPrefix).mockReturnValue('✅');
        vi.mocked(getIntervalPrefix).mockReturnValue('🪓');
    });

    it('should return an empty array when lines array is empty', () => {
        const result = extractTasks(mockFilePath, []);

        expect(result).toEqual([]);
        expect(buildTask).not.toHaveBeenCalled();
    });

    it('should ignore non-task lines such as headings, empty lines, and regular list items', () => {
        const lines = [
            '# Heading',
            '',
            '- Regular bullet point',
            '* Another bullet point',
            '1. Numbered item',
            'Just some random prose',
        ];

        const result = extractTasks(mockFilePath, lines);

        expect(result).toEqual([]);
        expect(hasAllTags).not.toHaveBeenCalled();
        expect(buildTask).not.toHaveBeenCalled();
    });

    it('should extract uncompleted (- [ ]) and completed (- [x]) tasks without tag filters', () => {
        const lines = [
            '- [ ] Task 1',
            'Non-task line',
            '- [x] Task 2 completed',
            '  - [ ] Indented task',
        ];

        const dummyTask1 = createDummyTask('Task 1');
        const dummyTask2 = createDummyTask('Task 2 completed');
        const dummyTask3 = createDummyTask('Indented task');

        vi.mocked(removeTags)
            .mockReturnValueOnce('- [ ] Task 1')
            .mockReturnValueOnce('- [x] Task 2 completed')
            .mockReturnValueOnce('  - [ ] Indented task');

        vi.mocked(buildTask)
            .mockReturnValueOnce(dummyTask1)
            .mockReturnValueOnce(dummyTask2)
            .mockReturnValueOnce(dummyTask3);

        const result = extractTasks(mockFilePath, lines);

        expect(result).toHaveLength(3);
        expect(result).toEqual([dummyTask1, dummyTask2, dummyTask3]);

        // Verify prefixes and configuration arguments passed to buildTask
        expect(buildTask).toHaveBeenNthCalledWith(
            1,
            '- [ ] Task 1',
            '⏳',
            '📅',
            '✅',
            '🪓',
            mockFilePath,
            true
        );
        expect(buildTask).toHaveBeenNthCalledWith(
            2,
            '- [x] Task 2 completed',
            '⏳',
            '📅',
            '✅',
            '🪓',
            mockFilePath,
            true
        );
    });

    it('should filter tasks based on includeTags and remove tags before building the task', () => {
        vi.mocked(getIncludeTags).mockReturnValue('#work');
        vi.mocked(getFallbackToFileDate).mockReturnValue(false);
        vi.mocked(getScheduledPrefix).mockReturnValue('S:');
        vi.mocked(getDuePrefix).mockReturnValue('D:');
        vi.mocked(getCompletionPrefix).mockReturnValue('C:');
        vi.mocked(getIntervalPrefix).mockReturnValue('I:');

        const lines = [
            '- [ ] Task with tag #work',
            '- [ ] Task without tag #personal',
            '- [x] Another task with tag #work',
        ];

        vi.mocked(hasAllTags).mockImplementation((line, tagStr) => {
            return tagStr === '#work' && line.includes('#work');
        });

        vi.mocked(removeTags).mockImplementation((line) => {
            return line.replace('#work', '').trim();
        });

        const dummyTask1 = createDummyTask('Task with tag');
        const dummyTask2 = createDummyTask('Another task with tag');

        vi.mocked(buildTask).mockReturnValueOnce(dummyTask1).mockReturnValueOnce(dummyTask2);

        const result = extractTasks(mockFilePath, lines);

        expect(hasAllTags).toHaveBeenCalledWith('- [ ] Task with tag #work', '#work');
        expect(hasAllTags).toHaveBeenCalledWith('- [ ] Task without tag #personal', '#work');
        expect(hasAllTags).toHaveBeenCalledWith('- [x] Another task with tag #work', '#work');

        expect(removeTags).toHaveBeenCalledWith('- [ ] Task with tag #work', '#work');
        expect(removeTags).not.toHaveBeenCalledWith('- [ ] Task without tag #personal', '#work');
        expect(removeTags).toHaveBeenCalledWith('- [x] Another task with tag #work', '#work');

        expect(buildTask).toHaveBeenCalledTimes(2);
        expect(buildTask).toHaveBeenNthCalledWith(
            1,
            '- [ ] Task with tag',
            'S:',
            'D:',
            'C:',
            'I:',
            mockFilePath,
            false
        );

        expect(result).toEqual([dummyTask1, dummyTask2]);
    });
});
