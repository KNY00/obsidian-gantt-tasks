import type { TaskItem } from '@/types';

export interface TaskListProps {
    tasks: TaskItem[];
    container: HTMLElement;
}

/**
 * Renders the collapsible list of tasks.
 */
export function renderTaskList({ tasks, container }: TaskListProps): HTMLElement {
    const ul = dv.el('ul', '', { cls: 'task-timeline-list', container });
    ul.style.display = 'none';

    tasks.forEach((task) => {
        const timePrefix =
            task.startTime && task.endTime ? `[${task.startTime} - ${task.endTime}] ` : '';
        const li = dv.el('li', '', { container: ul });
        dv.el('small', `${timePrefix}${task.name}`, { container: li });
    });

    return ul;
}

/**
 * Toggles the visibility display mode of the task list element.
 */
export function toggleTaskListVisibility(listElement: HTMLElement): void {
    if (listElement.style.display === 'none') {
        listElement.style.display = 'block';
    } else {
        listElement.style.display = 'none';
    }
}
