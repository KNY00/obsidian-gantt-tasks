import {
    chooseTaskDate,
    generateTimestamp,
    toDateObject,
    toDateString,
    toIntervalObject,
    toTimeObject,
} from './date-conversion';
import type { TaskItem } from '@/types';
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
    };
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
        let statusTag = ':active, ';
        if (task.status === 'done') statusTag = ':done, ';

        if (task.startTime == task.endTime) {
            statusTag = ':milestone, ';
        }

        const start = task.startTime ? `${chosenDate} ${task.startTime}` : `${chosenDate} 08:00`;
        const end = task.endTime ? `${chosenDate} ${task.endTime}` : `${chosenDate} 08:00`;

        // Example rows: Task Name :done, t1, 2026-08-23 08:30, 2026-08-23 09:00
        ganttRows.push(
            `    ${task.name.slice(0, 30)}${task.name.length > 30 ? '...' : ''} ${statusTag}${taskId}, ${start}, ${end}`
        );
    });

    return ganttRows.join('\n');
}
