import type { DateInput, TaskItem } from '@/types';
import { isDateEqual } from './date-conversion';
import { chooseTaskDate } from './ui';

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

    // If no date filter is applied, any task with a date is valid
    if (filterDate === null) {
        return chosenDate !== null;
    }

    // If a filter is applied, the task must have a chosen date and it must match
    return chosenDate !== null && isDateEqual(chosenDate, filterDate);
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

    validTasks.sort((a, b) => (a.timestamps.start ?? 0) - (b.timestamps.start ?? 0));

    return validTasks;
}
