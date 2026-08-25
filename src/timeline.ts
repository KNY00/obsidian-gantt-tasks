import { type TFile } from 'obsidian';
import { TaskItem } from './types';
import { decrementDayOffset, getDataviewAPI, incrementDayOffset } from './utils/dataview';
import { getFilteredTasks } from './utils/filter';
import { generateGanttMarkdown } from './utils/ui';
import { extractTasks } from './utils/tasks';
import {
    getExcludeTasksWithoutInterval,
    getTargetLocations,
    getStartDate,
} from './utils/normalize';
import { isTaskMatchingLocation } from './utils/path';
import { getStartDateWithOffset } from './utils/date-conversion';

const slowly = async () => {
    const dv = getDataviewAPI();
    // Retrieve all pages in the vault
    const pages = dv.pages();

    const locations = getTargetLocations();

    const globalTasks: TaskItem[] = [];

    // Iterate through each page
    for (const page of pages) {
        // Ignore files that contain the variable 'dataview' in their frontmatter
        if (page.dataview !== undefined) {
            continue;
        }

        if (!isTaskMatchingLocation(page.file, locations)) continue;

        // Retrieve the actual file object
        const tFile = app.vault.getAbstractFileByPath(page.file.path);

        if (!tFile) continue;

        // Read the raw text content of the file using .then() instead of await
        const content = await app.vault.read(tFile as TFile);
        const lines = content.split('\n');

        // Generate the output blocks using the external function
        // Passing the page path so we can generate internal links to the exact line
        const tasks = extractTasks(page.file.path, lines);

        globalTasks.push(...tasks);
    }

    return globalTasks;
};

slowly().then(async (globalTasks) => {
    const dv = getDataviewAPI();

    const container = dv.el('div', '', { cls: 'task-timeline-container' });
    container.style.textAlign = 'center';

    let p: HTMLParagraphElement | null = null;

    const renderTimeline = async () => {
        container.innerHTML = ''; // Clear previous elements on refresh

        if (p !== null) p.remove();

        // Add Button Group Container with Flex
        const btnGroup = dv.el('div', '', { container });
        Object.assign(btnGroup.style, {
            display: 'flex',
            marginTop: '10px',
            marginBottom: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: '4px',
        });

        const prevBtn = dv.el('button', 'Prev', { container: btnGroup });
        prevBtn.onclick = async () => {
            decrementDayOffset();
            prevBtn.setAttribute('disabled', 'true');
            await renderTimeline();
        };

        const cd = dv.el('small', ``, { container: btnGroup });

        const nextBtn = dv.el('button', 'Next', { container: btnGroup });
        nextBtn.onclick = async () => {
            incrementDayOffset();
            nextBtn.setAttribute('disabled', 'true');
            await renderTimeline();
        };

        const toggleTasksBtn = dv.el('button', 'Toggle Tasks', { container: btnGroup });

        toggleTasksBtn.onclick = async () => {
            if (ul.style.display === 'none') {
                ul.style.display = 'block';
            } else {
                ul.style.display = 'none';
            }
        };

        const filterDate = getStartDateWithOffset(getStartDate());

        cd.innerHTML = filterDate || '';

        const excludeTasksWithoutInterval = getExcludeTasksWithoutInterval();
        const filteredTasks = getFilteredTasks(
            globalTasks,
            filterDate,
            excludeTasksWithoutInterval
        );

        const ul = dv.el('ul', '', { cls: 'task-timeline-list', container });
        ul.style.display = 'none';

        filteredTasks.forEach((task) => {
            const timePrefix =
                task.startTime && task.endTime ? `[${task.startTime} - ${task.endTime}] ` : '';
            const li = dv.el('li', ``, { container: ul });
            dv.el('small', `${timePrefix}${task.name}`, { container: li });
        });

        const mermaidDefinition = generateGanttMarkdown(filteredTasks);

        let block = '```mermaid\n';
        block += mermaidDefinition;
        block += '\n```';

        p = dv.paragraph(block);
        p.style.margin = '0px';
    };

    await renderTimeline();
});
