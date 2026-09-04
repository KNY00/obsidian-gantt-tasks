import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveTimelineTasks } from '@/utils/tasks';
import { getStartDate, getExcludeTasksWithoutInterval } from '@/utils/normalize';
import { getStartDateWithOffset } from '@/utils/date-conversion';
import { getFilteredTasks, sortTasks } from '@/utils/filter';
import type { TaskItem } from '@/types';

// Mock all external dependencies to isolate resolveTimelineTasks
vi.mock('@/utils/normalize', () => ({
    getStartDate: vi.fn(),
    getExcludeTasksWithoutInterval: vi.fn(),
}));

vi.mock('@/utils/date-conversion', () => ({
    getStartDateWithOffset: vi.fn(),
}));

vi.mock('@/utils/filter', () => ({
    getFilteredTasks: vi.fn(),
    sortTasks: vi.fn(),
}));

describe('resolveTimelineTasks', () => {
    const createDummyTask = (name: string): TaskItem => ({
        name,
        fileNameDate: '2026-09-02',
        scheduledDate: '2026-09-02',
        dueDate: null,
        completionDate: null,
        startTime: '09:00',
        endTime: '10:00',
        status: 'active',
        isDisplayable: true,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should resolve date offset, filter tasks, sort them in-place, and return resolved timeline data', () => {
        const baseStartDate = '2026-09-01';
        const offsetDate = '2026-09-02';
        const excludeWithoutInterval = true;

        const rawTasks: TaskItem[] = [createDummyTask('Task B'), createDummyTask('Task A')];
        const filteredTasks: TaskItem[] = [createDummyTask('Task B'), createDummyTask('Task A')];

        // Configure mock behavior
        vi.mocked(getStartDate).mockReturnValue(baseStartDate);
        vi.mocked(getStartDateWithOffset).mockReturnValue(offsetDate);
        vi.mocked(getExcludeTasksWithoutInterval).mockReturnValue(excludeWithoutInterval);
        vi.mocked(getFilteredTasks).mockReturnValue(filteredTasks);

        const result = resolveTimelineTasks(rawTasks);

        // Verify retrieval of configuration and base date
        expect(getStartDate).toHaveBeenCalledTimes(1);
        expect(getStartDateWithOffset).toHaveBeenCalledWith(baseStartDate);
        expect(getExcludeTasksWithoutInterval).toHaveBeenCalledTimes(1);

        // Verify filtering and sorting execution
        expect(getFilteredTasks).toHaveBeenCalledWith(rawTasks, offsetDate, excludeWithoutInterval);
        expect(sortTasks).toHaveBeenCalledWith(filteredTasks);

        // Verify structure and values of the returned object
        expect(result).toEqual({
            filterDate: offsetDate,
            tasks: filteredTasks,
        });
    });

    it('should handle null resolved filter date and pass it downstream to getFilteredTasks', () => {
        const rawTasks: TaskItem[] = [createDummyTask('Task Without Filter Date')];
        const filteredTasks: TaskItem[] = [...rawTasks];

        vi.mocked(getStartDate).mockReturnValue('invalid-date');
        vi.mocked(getStartDateWithOffset).mockReturnValue(null);
        vi.mocked(getExcludeTasksWithoutInterval).mockReturnValue(false);
        vi.mocked(getFilteredTasks).mockReturnValue(filteredTasks);

        const result = resolveTimelineTasks(rawTasks);

        expect(getStartDateWithOffset).toHaveBeenCalledWith('invalid-date');
        expect(getFilteredTasks).toHaveBeenCalledWith(rawTasks, null, false);
        expect(sortTasks).toHaveBeenCalledWith(filteredTasks);
        expect(result).toEqual({
            filterDate: null,
            tasks: filteredTasks,
        });
    });

    it('should return an empty tasks array when no tasks match the filter', () => {
        vi.mocked(getStartDate).mockReturnValue('2026-09-02');
        vi.mocked(getStartDateWithOffset).mockReturnValue('2026-09-02');
        vi.mocked(getExcludeTasksWithoutInterval).mockReturnValue(true);
        vi.mocked(getFilteredTasks).mockReturnValue([]);

        const result = resolveTimelineTasks([]);

        expect(getFilteredTasks).toHaveBeenCalledWith([], '2026-09-02', true);
        expect(sortTasks).toHaveBeenCalledWith([]);
        expect(result).toEqual({
            filterDate: '2026-09-02',
            tasks: [],
        });
    });
});
