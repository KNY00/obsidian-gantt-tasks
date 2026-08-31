import { describe, it, expect } from 'vitest';
import { buildTask, generateGanttMarkdown } from '@/utils/ui';
import { TaskItem } from '@/types';

describe('ui utils', () => {
    describe('buildTask', () => {
        const blockLine = '- [ ] Buy groceries 📅 2023-10-01 ⏰ 09:00-10:00';
        const scheduledPrefix = '📅';
        const duePrefix = 'due:';
        const completionPrefix = '✅';
        const timePrefix = '⏰';
        const filePath = 'notes/2023-10-01.md';

        it('should correctly parse a task line into a TaskItem', () => {
            const task = buildTask(
                blockLine,
                scheduledPrefix,
                duePrefix,
                completionPrefix,
                timePrefix,
                filePath,
                false
            );

            expect(task.name).toBe('Buy groceries');
            expect(task.scheduledDate).toBe('2023-10-01');
            expect(task.startTime).toBe('09:00');
            expect(task.endTime).toBe('10:00');
            expect(task.status).toBe('active');
            expect(task.isDisplayable).toBe(true);
        });

        it('should fallback to file date when enabled and task has no other dates', () => {
            const simpleLine = '- [ ] Review notes ⏰ 10:00-11:00';
            const task = buildTask(
                simpleLine,
                scheduledPrefix,
                duePrefix,
                completionPrefix,
                timePrefix,
                filePath,
                true
            );

            expect(task.fileNameDate).toBe('2023-10-01');
            expect(task.isDisplayable).toBe(true);
        });
    });

    describe('generateGanttMarkdown', () => {
        it('should generate valid mermaid gantt chart markup', () => {
            const mockTasks: TaskItem[] = [
                {
                    name: 'Task One',
                    fileNameDate: null,
                    scheduledDate: '2023-10-01',
                    dueDate: null,
                    completionDate: null,
                    startTime: '08:00',
                    endTime: '09:00',
                    status: 'active',
                    isDisplayable: true,
                },
            ];

            const gantt = generateGanttMarkdown(mockTasks, 'My Plan');

            expect(gantt).toContain('gantt');
            expect(gantt).toContain('dateFormat YYYY-MM-DD HH:mm');
            expect(gantt).toContain('Task One :active, t1, 2023-10-01 08:00, 2023-10-01 09:00');
        });

        it('should handle milestone tasks when start and end times are equal', () => {
            const mockTasks: TaskItem[] = [
                {
                    name: 'Milestone Task',
                    fileNameDate: null,
                    scheduledDate: '2023-10-01',
                    dueDate: null,
                    completionDate: null,
                    startTime: '12:00',
                    endTime: '12:00',
                    status: 'active',
                    isDisplayable: true,
                },
            ];

            const gantt = generateGanttMarkdown(mockTasks);

            expect(gantt).toContain(
                'Milestone Task :milestone, t1, 2023-10-01 12:00, 2023-10-01 12:00'
            );
        });

        it('should handle a done task', () => {
            const mockTasks: TaskItem[] = [
                {
                    name: 'Task One',
                    fileNameDate: null,
                    scheduledDate: '2023-10-01',
                    dueDate: null,
                    completionDate: null,
                    startTime: '08:00',
                    endTime: '09:00',
                    status: 'done',
                    isDisplayable: true,
                },
            ];

            const gantt = generateGanttMarkdown(mockTasks, 'My Plan');

            expect(gantt).toContain('gantt');
            expect(gantt).toContain('dateFormat YYYY-MM-DD HH:mm');
            expect(gantt).toContain('Task One :done, t1, 2023-10-01 08:00, 2023-10-01 09:00');
        });

        it('should handle a task without dates', () => {
            const mockTasks: TaskItem[] = [
                {
                    name: 'Task One',
                    fileNameDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    completionDate: null,
                    startTime: null,
                    endTime: null,
                    status: 'done',
                    isDisplayable: true,
                },
            ];

            const gantt = generateGanttMarkdown(mockTasks, 'My Plan');

            expect(gantt.split('section Tasks')[1]).toEqual('');
        });

        it('should handle a task without interval', () => {
            const mockTasks: TaskItem[] = [
                {
                    name: 'Task One',
                    fileNameDate: null,
                    scheduledDate: '2023-10-01',
                    dueDate: null,
                    completionDate: null,
                    startTime: null,
                    endTime: null,
                    status: 'done',
                    isDisplayable: true,
                },
            ];

            const gantt = generateGanttMarkdown(mockTasks, 'My Plan');

            expect(gantt).toContain('Task One :milestone, t1, 2023-10-01 08:00, 2023-10-01 08:00');
        });
    });
});
