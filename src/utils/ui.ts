import {
    generateTimestamp,
    toDateObject,
    toDateString,
    toIntervalObject,
    toTimeObject,
} from './date-conversion';
import { TaskItem } from '@/types';
import { dateFromTaskPath, extractTokenAfterPrefix } from './string-parsing';

export function buildTask(
    blockLine: string,
    scheduledDatePrefix: string,
    dueDatePrefix: string,
    completionDatePrefix: string,
    timeIntervalPrefix: string,
    filePath: string,
    fallBackToFileDate: boolean = false
): TaskItem {
    // Extraction des dates brutes et conversion via toDateString
    const rawScheduled = extractTokenAfterPrefix(blockLine, scheduledDatePrefix);
    const rawDue = extractTokenAfterPrefix(blockLine, dueDatePrefix);
    const rawCompletion = extractTokenAfterPrefix(blockLine, completionDatePrefix);

    const scheduledDate = toDateString(rawScheduled);
    const dueDate = toDateString(rawDue);
    const completionDate = toDateString(rawCompletion);

    const rawInterval = extractTokenAfterPrefix(blockLine, timeIntervalPrefix);
    const { startingTime, endingTime } = toIntervalObject(rawInterval);

    const startTime = startingTime;
    const endTime = endingTime;

    const status = completionDate !== null ? 'done' : 'active';

    let name = blockLine;

    const prefixes = [
        { prefix: scheduledDatePrefix, val: rawScheduled },
        { prefix: dueDatePrefix, val: rawDue },
        { prefix: completionDatePrefix, val: rawCompletion },
        { prefix: timeIntervalPrefix, val: rawInterval },
    ];

    for (const item of prefixes) {
        if (item.val) {
            const fullPattern = `${item.prefix} ${item.val}`;
            name = name.replace(fullPattern, '');
        }
    }

    name = name.replace(/-\s*\[([ xX])\]\s*/, '').trim();

    const chosenDate = chooseTaskDate(completionDate, dueDate, scheduledDate);
    const dateObject = toDateObject(chosenDate);
    const startTimeObject = toTimeObject(startTime);
    const endTimeObject = toTimeObject(endTime);

    let start = null;
    let end = null;

    if (dateObject !== null && startTimeObject !== null) {
        start = generateTimestamp({ ...dateObject, ...startTimeObject });
    }

    if (dateObject !== null && endTimeObject !== null) {
        end = generateTimestamp({ ...dateObject, ...endTimeObject });
    }

    let fileNameDate: string | null = null;

    if (fallBackToFileDate) {
        fileNameDate = dateFromTaskPath(filePath);
    }

    return {
        name,
        fileNameDate,
        scheduledDate,
        dueDate,
        completionDate,
        startTime,
        endTime,
        status,
        isDisplayable:
            scheduledDate !== null ||
            dueDate !== null ||
            completionDate !== null ||
            fileNameDate !== null,
        timestamps: {
            start,
            end,
        },
    };
}

/**
 * Selects the most relevant task date based on a strict priority hierarchy.
 * Priority order: Completion Date (highest) > Due Date > Scheduled Date (lowest).
 *
 * @template H - A string type representing a date (extends DateString).
 * @param scheduledDate - Optional scheduled date of the task.
 * @param dueDate - Optional due date of the task.
 * @param completionDate - Optional completion date of the task.
 *
 * @returns The first available date matching the highest priority, or undefined if none are provided.
 */
export function chooseTaskDate<H extends string | null>(
    completionDate?: H,
    dueDate?: H,
    scheduledDate?: H,
    fallbackDate?: H
): H | null {
    // Order from highest priority to lowest priority
    return (
        [completionDate, dueDate, scheduledDate, fallbackDate].find((date): date is H =>
            Boolean(date)
        ) ?? null
    );
}

export function generateGanttMarkdown(tasks: TaskItem[], title: string = '📅 Plan'): string {
    // `title ${title}`,
    const ganttRows: string[] = [
        'gantt',
        'dateFormat YYYY-MM-DD HH:mm',
        'axisFormat %H:%M',
        'section Tasks',
    ];

    tasks.forEach((task, index) => {
        const taskId = `t${index + 1}`;

        const chosenDate = chooseTaskDate(
            task.completionDate,
            task.dueDate,
            task.scheduledDate,
            task.fileNameDate
        );

        if (chosenDate == null) return;

        // Determine status tags for mermaid (e.g., :done, :active, etc.)
        let statusTag;

        if (task.status === 'done') statusTag = ':done, ';
        else if (task.status === 'active') statusTag = ':active, ';
        else if (task.status === 'crit') statusTag = ':crit, ';
        else statusTag = ': ';

        if (task.startTime == task.endTime) {
            statusTag = ': milestone, ';
        }

        const start = task.startTime ? `${chosenDate} ${task.startTime}` : `${chosenDate} 08:00`;
        const end = task.endTime ? `${chosenDate} ${task.endTime}` : `${chosenDate} 08:15`;

        // Example rows: Task Name :done, t1, 2026-08-23 08:30, 2026-08-23 09:00
        ganttRows.push(
            `    ${task.name.slice(0, 30)}${task.name.length > 30 ? '...' : ''} ${statusTag}${taskId}, ${start}, ${end}`
        );
    });

    return ganttRows.join('\n');
}
