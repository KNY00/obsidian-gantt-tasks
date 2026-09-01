import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTasks, fetchAllTasks } from '@/utils/tasks';
import type { TaskItem } from '@/types';
import { getIncludeTags, getTargetLocations } from '@/utils/normalize';
import { isFileMatchingLocation } from '@/utils/path';
import { getDataviewAPI } from '@/utils/dataview';
import { buildTask } from '@/utils/ui';

// Mock all external modules and dependencies to enforce separation of concerns
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
    getTargetLocations: vi.fn(),
}));

vi.mock('@/utils/path', () => ({
    isFileMatchingLocation: vi.fn(),
}));

vi.mock('@/utils/dataview', () => ({
    getDataviewAPI: vi.fn(),
}));

describe('fetchAllTasks', () => {
    let mockDv: { pages: ReturnType<typeof vi.fn> };
    let mockApp: {
        vault: {
            getAbstractFileByPath: ReturnType<typeof vi.fn>;
            read: ReturnType<typeof vi.fn>;
        };
    };

    const createDummyTask = (name: string): TaskItem => ({
        name,
        fileNameDate: '2026-09-01',
        scheduledDate: '2026-09-01',
        dueDate: null,
        completionDate: null,
        startTime: '08:00',
        endTime: '09:00',
        status: 'active',
        isDisplayable: true,
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Dataview API mock
        mockDv = {
            pages: vi.fn().mockReturnValue([]),
        };
        vi.mocked(getDataviewAPI).mockReturnValue(mockDv as any);

        // Setup global Obsidian App vault mock
        mockApp = {
            vault: {
                getAbstractFileByPath: vi.fn(),
                read: vi.fn().mockResolvedValue(''),
            },
        };

        (globalThis as any).app = mockApp;

        // Default configuration mock returns
        vi.mocked(getTargetLocations).mockReturnValue('Journal');
        vi.mocked(isFileMatchingLocation).mockReturnValue(true);
    });

    it('should return an empty array when Dataview returns no pages', async () => {
        mockDv.pages.mockReturnValue([]);

        const result = await fetchAllTasks();

        expect(result).toEqual([]);
        expect(getDataviewAPI).toHaveBeenCalledTimes(1);
        expect(mockDv.pages).toHaveBeenCalledTimes(1);
        expect(getTargetLocations).toHaveBeenCalledTimes(1);
        expect(mockApp.vault.getAbstractFileByPath).not.toHaveBeenCalled();
    });

    it('should skip pages containing dataview in their frontmatter', async () => {
        const pageWithDataview = {
            file: { path: 'Journal/Config.md' },
            dataview: true,
        };
        const validPage = {
            file: { path: 'Journal/2026-09-01.md' },
        };

        const dummyTask = createDummyTask('Valid Task');

        vi.mocked(getIncludeTags).mockReturnValue('');
        vi.mocked(buildTask).mockReturnValue(dummyTask);
        mockDv.pages.mockReturnValue([pageWithDataview, validPage]);
        mockApp.vault.getAbstractFileByPath.mockReturnValue({ path: 'Journal/2026-09-01.md' });
        mockApp.vault.read.mockResolvedValue('- [ ] Valid Task');

        // Spy on extractTasks to verify call delegation without re-testing internal parser logic
        const extractTasksSpy = vi
            .spyOn({ extractTasks }, 'extractTasks')
            .mockReturnValue([dummyTask]);

        const result = await fetchAllTasks();

        // Should not process the page with dataview property
        expect(isFileMatchingLocation).not.toHaveBeenCalledWith(pageWithDataview.file, 'Journal');
        expect(mockApp.vault.getAbstractFileByPath).not.toHaveBeenCalledWith('Journal/Config.md');

        // Should process the valid page
        expect(isFileMatchingLocation).toHaveBeenCalledWith(validPage.file, 'Journal');
        expect(mockApp.vault.getAbstractFileByPath).toHaveBeenCalledWith('Journal/2026-09-01.md');
        expect(mockApp.vault.read).toHaveBeenCalledWith({ path: 'Journal/2026-09-01.md' });
        expect(result).toEqual([dummyTask]);

        extractTasksSpy.mockRestore();
    });

    it('should skip files that do not match the target location', async () => {
        const nonMatchingPage = {
            file: { path: 'Notes/Other.md' },
        };

        mockDv.pages.mockReturnValue([nonMatchingPage]);
        vi.mocked(isFileMatchingLocation).mockReturnValue(false);

        const result = await fetchAllTasks();

        expect(isFileMatchingLocation).toHaveBeenCalledWith(nonMatchingPage.file, 'Journal');
        expect(mockApp.vault.getAbstractFileByPath).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('should skip files when getAbstractFileByPath returns null or undefined', async () => {
        const page = {
            file: { path: 'Journal/Missing.md' },
        };

        mockDv.pages.mockReturnValue([page]);
        vi.mocked(isFileMatchingLocation).mockReturnValue(true);
        mockApp.vault.getAbstractFileByPath.mockReturnValue(null);

        const result = await fetchAllTasks();

        expect(mockApp.vault.getAbstractFileByPath).toHaveBeenCalledWith('Journal/Missing.md');
        expect(mockApp.vault.read).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('should read matching files, split lines, extract tasks, and aggregate them across multiple files', async () => {
        const page1 = { file: { path: 'Journal/2026-09-01.md' } };
        const page2 = { file: { path: 'Journal/2026-09-02.md' } };

        mockDv.pages.mockReturnValue([page1, page2]);
        vi.mocked(getTargetLocations).mockReturnValue('Journal');
        vi.mocked(isFileMatchingLocation).mockReturnValue(true);

        const mockTFile1 = { path: 'Journal/2026-09-01.md' };
        const mockTFile2 = { path: 'Journal/2026-09-02.md' };

        mockApp.vault.getAbstractFileByPath
            .mockReturnValueOnce(mockTFile1)
            .mockReturnValueOnce(mockTFile2);

        const content1 = '- [ ] Task 1\n- [ ] Task 2';
        const content2 = '- [x] Task 3';

        mockApp.vault.read.mockResolvedValueOnce(content1).mockResolvedValueOnce(content2);

        const task1 = createDummyTask('Task 1');
        const task2 = createDummyTask('Task 2');
        const task3 = createDummyTask('Task 3');

        // Configure consecutive mock returns for dummy tasks
        vi.mocked(buildTask)
            .mockReturnValueOnce(task1)
            .mockReturnValueOnce(task2)
            .mockReturnValueOnce(task3);

        const result = await fetchAllTasks();

        expect(mockApp.vault.read).toHaveBeenNthCalledWith(1, mockTFile1);
        expect(mockApp.vault.read).toHaveBeenNthCalledWith(2, mockTFile2);

        expect(result).toHaveLength(3);
        expect(result).toEqual([task1, task2, task3]);
    });
});
