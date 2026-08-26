import type { DateInput, TaskItem } from '@/types';
import { chooseTaskDate, getTaskTimestamps, isDateEqual } from './date-conversion';

export const hasValidInterval = (task: TaskItem) => {
    return task.startTime != null && task.endTime != null;
};

const filterByDate = (task: TaskItem, filterDate: DateInput | string | null = null) => {
    const chosenDate = chooseTaskDate(
        task.completionDate,
        task.dueDate,
        task.scheduledDate,
        task.fileNameDate
    );

    // if no date filter is applied, any task with a date is valid
    if (filterDate === null) {
        return chosenDate !== null;
    }

    // if a filter is applied, the task must have a chosen date and it must match
    return chosenDate !== null && isDateEqual(chosenDate, filterDate);
};

/**
 * Sorts an array of task items chronologically based on their start timestamps.
 * Modifies the original array in place.
 *
 * @param tasks - Array of TaskItem objects to be sorted
 */
const sortTasks = (tasks: TaskItem[]) => {
    tasks.sort((a, b) => {
        const timeA = getTaskTimestamps(a);
        const timeB = getTaskTimestamps(b);

        return timeA.start - timeB.start;
    });
};

export function getFilteredTasks(
    tasks: TaskItem[],
    filterDate: DateInput | string | null = null,
    excludeTasksWithoutInterval: boolean
) {
    // && keepInterval(task) &&
    const validTasks = tasks.filter(
        (task) =>
            task.isDisplayable &&
            filterByDate(task, filterDate) &&
            (!excludeTasksWithoutInterval || hasValidInterval(task))
    );

    // TODO: move this
    sortTasks(validTasks);

    return validTasks;
}

/* v8 ignore next */
export const _testing = process.env.NODE_ENV === 'test' ? { filterByDate, sortTasks } : undefined;
