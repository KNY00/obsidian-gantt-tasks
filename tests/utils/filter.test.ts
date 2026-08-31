import { describe, it, expect } from 'vitest';
import { hasValidInterval, getFilteredTasks, _testing, sortTasks } from '@/utils/filter';
import { TaskItem } from '@/types';
import { afterEach, beforeEach } from 'node:test';

const createMockTask = (overrides: Partial<TaskItem> = {}): TaskItem => ({
    name: 'Sample Task',
    fileNameDate: null,
    scheduledDate: null,
    dueDate: null,
    completionDate: null,
    startTime: null,
    endTime: null,
    status: 'active',
    isDisplayable: true,
    ...overrides,
});

describe('filter utils', () => {
    describe('hasValidInterval', () => {
        it('should return true if both startTime and endTime are defined', () => {
            const task = { startTime: '08:00', endTime: '09:00' } as TaskItem;
            expect(hasValidInterval(task)).toBe(true);
        });

        it('should return false if either startTime or endTime is missing', () => {
            const taskWithoutStart = { startTime: null, endTime: '09:00' } as TaskItem;
            const taskWithoutEnd = { startTime: '08:00', endTime: null } as TaskItem;
            const taskWithoutBoth = { startTime: null, endTime: null } as TaskItem;

            expect(hasValidInterval(taskWithoutStart)).toBe(false);
            expect(hasValidInterval(taskWithoutEnd)).toBe(false);
            expect(hasValidInterval(taskWithoutBoth)).toBe(false);
        });
    });

    describe('filterByDate', () => {
        const baseTask: TaskItem = {
            name: 'Test Task',
            fileNameDate: null,
            scheduledDate: null,
            dueDate: null,
            completionDate: '2023-10-01',
            startTime: '08:00',
            endTime: '09:00',
            status: 'open',
            isDisplayable: true,
        };

        it('should return true when no filterDate is provided and task has a date', () => {
            expect(_testing!.filterByDate(baseTask, null)).toBe(true);
        });

        it('should return false when no filterDate is provided and task has no dates at all', () => {
            const taskWithoutDates: TaskItem = {
                ...baseTask,
                completionDate: null,
                dueDate: null,
                scheduledDate: null,
                fileNameDate: null,
            };
            expect(_testing!.filterByDate(taskWithoutDates, null)).toBe(false);
        });

        it('should return true when filterDate matches the chosen task date', () => {
            // completionDate is '2023-10-01'
            expect(_testing!.filterByDate(baseTask, '2023-10-01')).toBe(true);
        });

        it('should return false when filterDate does not match the chosen task date', () => {
            expect(_testing!.filterByDate(baseTask, '2023-10-05')).toBe(false);
        });
    });

    describe('sortTasks', () => {
        it('should sort tasks in-place in chronological order based on startTime and date', () => {
            const taskEarly = createMockTask({
                name: 'Early Task',
                completionDate: '2026-08-28',
                startTime: '10:00',
            });

            const taskLate = createMockTask({
                name: 'Late Task',
                completionDate: '2026-08-28',
                startTime: '12:00',
            });

            const taskMid = createMockTask({
                name: 'Mid Task',
                completionDate: '2026-08-28',
                startTime: '11:00',
            });

            const tasks = [taskLate, taskEarly, taskMid];
            sortTasks!(tasks);

            expect(tasks.map((t) => t.name)).toEqual(['Early Task', 'Mid Task', 'Late Task']);
        });
    });

    describe('getFilteredTasks', () => {
        it('should exclude tasks where isDisplayable is false', () => {
            const displayableTask = createMockTask({
                name: 'Displayable',
                scheduledDate: '2026-08-28',
                isDisplayable: true,
            });

            const nonDisplayableTask = createMockTask({
                name: 'Hidden',
                scheduledDate: '2026-08-28',
                isDisplayable: false,
            });

            const result = getFilteredTasks(
                [displayableTask, nonDisplayableTask],
                '2026-08-28',
                false
            );
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Displayable');
        });

        describe('date filtering', () => {
            it('should return tasks matching the target date using date string', () => {
                const taskToday = createMockTask({
                    name: 'Today task',
                    scheduledDate: '2026-08-28',
                });
                const taskTomorrow = createMockTask({
                    name: 'Tomorrow task',
                    scheduledDate: '2026-08-29',
                });

                const result = getFilteredTasks([taskToday, taskTomorrow], '2026-08-28', false);
                expect(result).toEqual([taskToday]);
            });

            it('should return all tasks with any valid date when filterDate is null', () => {
                const taskWithDate = createMockTask({
                    name: 'Has Date',
                    scheduledDate: '2026-08-28',
                });
                const taskWithoutDate = createMockTask({ name: 'No Date' });

                const result = getFilteredTasks([taskWithDate, taskWithoutDate], null, false);
                expect(result).toEqual([taskWithDate]);
            });
        });

        describe('excludeTasksWithoutInterval parameter', () => {
            it('should keep tasks without intervals when excludeTasksWithoutInterval is false', () => {
                const taskWithoutInterval = createMockTask({
                    name: 'Task without interval',
                    scheduledDate: '2026-08-28',
                    startTime: null,
                    endTime: null,
                });

                const result = getFilteredTasks([taskWithoutInterval], '2026-08-28', false);
                expect(result).toHaveLength(1);
            });

            it('should exclude tasks without intervals when excludeTasksWithoutInterval is true', () => {
                const taskWithInterval = createMockTask({
                    name: 'Task with interval',
                    scheduledDate: '2026-08-28',
                    startTime: '08:00',
                    endTime: '09:00',
                });

                const taskWithoutInterval = createMockTask({
                    name: 'Task without interval',
                    scheduledDate: '2026-08-28',
                    startTime: null,
                    endTime: null,
                });

                const taskWithPartialInterval = createMockTask({
                    name: 'Task with partial interval',
                    scheduledDate: '2026-08-28',
                    startTime: '08:00',
                    endTime: null,
                });

                const result = getFilteredTasks(
                    [taskWithInterval, taskWithoutInterval, taskWithPartialInterval],
                    '2026-08-28',
                    true
                );

                expect(result).toHaveLength(1);
                expect(result[0].name).toBe('Task with interval');
            });
        });
    });
});
