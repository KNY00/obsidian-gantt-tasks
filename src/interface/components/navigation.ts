import { decrementDayOffset, incrementDayOffset } from '@/utils/dataview';

export interface NavigationProps {
    currentDate: string | null;
    container: HTMLElement;
    onDateChange: () => Promise<void>;
    onToggleTasks: () => void;
}

/**
 * Creates the navigation bar containing previous/next buttons,
 * the active date label, and the task list visibility toggle.
 */
export function renderNavigation({
    currentDate,
    container,
    onDateChange,
    onToggleTasks,
}: NavigationProps): HTMLElement {
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
        await onDateChange();
    };

    const dateLabel = dv.el('small', currentDate || '', { container: btnGroup });

    const nextBtn = dv.el('button', 'Next', { container: btnGroup });
    nextBtn.onclick = async () => {
        incrementDayOffset();
        nextBtn.setAttribute('disabled', 'true');
        await onDateChange();
    };

    const toggleTasksBtn = dv.el('button', 'Toggle Tasks', { container: btnGroup });
    toggleTasksBtn.onclick = () => {
        onToggleTasks();
    };

    return btnGroup;
}
