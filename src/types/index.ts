import { type DateTime } from 'luxon';

export type Time = DateTime;

export type DateInput = Pick<Time, 'year' | 'month' | 'day'>;

export interface DateTimeObject {
    year: number;
    month: number; // 1-12 (or 0-11 depending on your convention, handled below)
    day: number;
    hour: number;
    minute: number;
}

export interface TaskItem {
    name: string;
    /** date extracted from fileName */
    fileNameDate: string | null;
    scheduledDate: string | null;
    dueDate: string | null;
    completionDate: string | null;
    startTime: string | null;
    endTime: string | null;
    status: string;
    /**
     * Determines whether the task meets all necessary criteria to be rendered
     * in the timeline/UI view.
     */
    isDisplayable: boolean;
}
