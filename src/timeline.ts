import { getDataviewAPI } from './utils/dataview';
import { fetchAllTasks, resolveTimelineTasks } from './utils/tasks';
import { renderNavigation } from './interface/components/navigation';
import { renderTaskList, toggleTaskListVisibility } from './interface/components/taskList';
import { renderGanttParagraph } from './interface/components/ganttParagraph';

fetchAllTasks().then(async (globalTasks) => {
    const dv = getDataviewAPI();

    const container = dv.el('div', '', { cls: 'task-timeline-container' });
    container.style.textAlign = 'center';

    let ganttParagraph: HTMLParagraphElement | null = null;

    const renderTimeline = async () => {
        // Clear previous container elements on refresh
        container.innerHTML = '';

        if (ganttParagraph !== null) {
            ganttParagraph.remove();
        }

        // 1. Task recovery and resolution
        const { filterDate, tasks } = resolveTimelineTasks(globalTasks);

        // 2. Navigation bar component
        let taskListElement: HTMLElement | null = null;

        renderNavigation({
            currentDate: filterDate,
            container,
            onDateChange: renderTimeline,
            onToggleTasks: () => {
                if (taskListElement) {
                    toggleTaskListVisibility(taskListElement);
                }
            },
        });

        // 3. Task list component
        taskListElement = renderTaskList({
            tasks,
            container,
        });

        // 4. Gantt mermaid paragraph component
        ganttParagraph = renderGanttParagraph({
            tasks,
        });
    };

    await renderTimeline();
});
