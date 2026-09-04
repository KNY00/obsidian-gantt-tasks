import type { TaskItem } from '@/types';
import { generateGanttMarkdown } from '@/utils/ui';

export interface GanttParagraphProps {
    tasks: TaskItem[];
}

/**
 * Generates and displays the Mermaid Gantt chart paragraph.
 */
export function renderGanttParagraph({ tasks }: GanttParagraphProps): HTMLParagraphElement {
    const mermaidDefinition = generateGanttMarkdown(tasks);

    let block = '```mermaid\n';
    block += mermaidDefinition;
    block += '\n```';

    const p = dv.paragraph(block);
    p.style.margin = '0px';

    return p;
}
