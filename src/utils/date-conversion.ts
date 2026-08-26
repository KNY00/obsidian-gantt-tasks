import type { DateInput, DateTimeObject, TaskItem } from '@/types';
import { getDayOffset } from './dataview';

/**
 * Validates that a given year, 1-indexed month, and day form a valid calendar date
 * using UTC to avoid timezone/DST issues.
 *
 * @param year - The full year.
 * @param month - The month (1-12).
 * @param day - The day of the month (1-31).
 * @returns True if the date components form a valid calendar date, false otherwise.
 */
export function isValidDate(year: number, month: number, day: number): boolean {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return false;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    const jsMonth = month - 1;
    const reconstructed = new Date(Date.UTC(year, jsMonth, day));

    return (
        !isNaN(reconstructed.getTime()) &&
        reconstructed.getUTCFullYear() === year &&
        reconstructed.getUTCMonth() === jsMonth &&
        reconstructed.getUTCDate() === day
    );
}

/**
 * Converts a "YYYY-MM-DD" date string into a structured date object.
 *
 * Performs validation on:
 * - Null safety (returns null for null inputs)
 * - Exact three parts separated by hyphens (year, month, day)
 * - String type validity and finite numeric values for each part
 *
 * @param str - The date string in "YYYY-MM-DD" format, or null.
 * @returns An object containing numeric year, month, and day properties, or null if invalid.
 */
export const toDateObject = (str: string | null) => {
    if (str === null) return null;

    const [year, month, day] = str.split('-');

    if (year && month && day) {
        const [y, m, d] = [year, month, day].map((z) => parseInt(z, 10));

        const check2 = [y, m, d].every((el) => Number.isFinite(el));

        if (!check2) return null;

        if (!isValidDate(y, m, d)) return null;

        return {
            year: y,
            month: m,
            day: d,
        };
    }

    return null;
};

/**
 * Converts an "HH:MM" time string into a structured time object.
 *
 * Performs validation on:
 * - Null safety (returns null for null inputs)
 * - Exact two parts separated by a colon (hours, minutes)
 * - String type validity and finite numeric values for each part
 * - Logical time ranges (hours: 0-23, minutes: 0-60)
 *
 * @param str - The time string in "HH:MM" format, or null.
 * @returns An object containing numeric hour and minute properties, or null if invalid.
 */
export const toTimeObject = (str: string | null) => {
    if (str === null) return null;

    const [hours, minutes] = str.split(':');

    if (hours && minutes) {
        const [h, m] = [hours, minutes].map((z) => parseInt(z, 10));

        const check2 = [h, m].every((el) => Number.isFinite(el));

        if (!check2) return null;

        if (h >= 0 && m >= 0 && h < 24 && m <= 60) {
            return {
                hour: h,
                minute: m,
            };
        }
    }

    return null;
};

/**
 * Generates a timestamp in milliseconds from a date/time component object.
 *
 * @param dt - Object containing year, month, day, hour, and minute.
 * @returns The timestamp in milliseconds (epoch time).
 */
export function generateTimestamp(dt: DateTimeObject): number {
    return new Date(
        dt.year,
        dt.month - 1,
        dt.day,
        dt.hour,
        dt.minute,
        0, // seconds
        0 // milliseconds
    ).getTime();
}

/**
 * Compares two dates (either date objects or date strings)
 * to check if they represent the exact same calendar day.
 *
 * @param firstDate - The first date object or date string.
 * @param secondDate - The second date object or date string.
 * @returns True if the year, month, and day match for both dates, false otherwise.
 */
export const isDateEqual = (firstDate: DateInput | string, secondDate: DateInput | string) => {
    // Convert strings to date objects if necessary
    const d1 = typeof firstDate === 'string' ? toDateObject(firstDate) : firstDate;
    const d2 = typeof secondDate === 'string' ? toDateObject(secondDate) : secondDate;

    if (!d1 || !d2) return false;

    return d1.day === d2.day && d1.month === d2.month && d1.year === d2.year;
};

/**
 * Formats hours and minutes into a standard "HH.:MM" time string with leading zeros.
 *
 * @param hours - The hour value (0-23).
 * @param minutes - The minute value (0-59).
 * @returns The formatted time string in HH:MM format.
 */
export function formatTime(hours: number, minutes: number): string {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');

    return `${h}:${m}`;
}

/**
 * Formats a year, month, and day into a standard "YYYY-MM-DD" date string with leading zeros.
 *
 * @param year - The year.
 * @param month - The month (1-12).
 * @param day - The day of the month (1-31).
 * @returns The formatted date string in YYYY-MM-DD format.
 */
export function formatDate(year: number, month: number, day: number): string {
    const y = String(year).padStart(4, '0');
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

/**
 * Validates whether a given string is a valid time in "HH:MM" format.
 *
 * Performs checks on:
 * - Null safety (returns false for null inputs)
 * - Presence of both hours and minutes separated by a colon
 * - Numeric validity of the extracted parts
 * - Logical time ranges (hours: 0-23, minutes: 0-60)
 *
 * @param str - The time string to validate, or null.
 * @returns True if the string represents a valid time format, null otherwise.
 */
export const toTimeString = (str: string | null) => {
    if (str === null) return null;

    const [hours, minutes] = str.split(':');

    if (hours && minutes) {
        const [h, m] = [hours, minutes].map((z) => parseInt(z, 10));

        const check2 = [h, m].every((el) => Number.isFinite(el));

        if (!check2) return null;

        if (h >= 0 && m >= 0 && h < 24 && m <= 60) {
            return formatTime(h, m);
        }
    }

    return null;
};

/**
 * Validates and normalizes a given string into a standard "YYYY-MM-DD" date string.
 *
 * Performs checks on:
 * - Null safety (returns null/input for null inputs)
 * - Presence of three parts separated by hyphens
 * - String type validity and finite numeric values for year, month, and day
 *
 * @param str - The date string to validate and normalize, or null.
 * @returns The formatted "YYYY-MM-DD" date string, or null if invalid.
 */
export const toDateString = (str: string | null) => {
    if (str === null) return str;

    const [year, month, day] = str.split('-');

    if (year && month && day) {
        const [y, m, d] = [year, month, day].map((z) => parseInt(z, 10));

        const check2 = [y, m, d].every((el) => Number.isFinite(el));

        if (!check2) return null;

        return formatDate(y, m, d);
    }

    return null;
};

/**
 * Validates whether a given string represents a valid time interval in "HH:MM-HH:MM" format.
 *
 * Performs checks on:
 * - Null safety (returns false for null inputs)
 * - Presence of two parts separated by a hyphen ('-')
 * - String type validity for both parts
 * - Valid time strings for both the starting and ending times (using `isTimeString`)
 *
 * @param str - The time interval string to validate, or null.
 * @returns True if both start and end times are valid time strings, null otherwise.
 */
export const toIntervalObject = (str: string | null) => {
    const nullReturn = {
        startingTime: null,
        endingTime: null,
    };

    if (str === null) return nullReturn;

    const [startingTime, endingTime] = str.split('-');

    if (startingTime && endingTime) {
        const check2 = [startingTime, endingTime].every((z) => toTimeString(z) !== null);

        if (!check2) return nullReturn;

        return {
            startingTime: toTimeString(startingTime),
            endingTime: toTimeString(endingTime),
        };
    }

    return nullReturn;
};

/**
 * Validates whether an unknown value is a valid calendar date object.
 *
 * Checks for non-null object type, finite integer components, and actual calendar validity (including leap years and month lengths).
 *
 * @param obj - The unknown value to validate.
 * @returns True if the object represents a valid calendar date, false otherwise.
 */
export function isValidDateObject(obj: unknown): obj is DateInput {
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const { year, month, day } = obj as Record<string, unknown>;

    if (
        typeof year !== 'number' ||
        !Number.isFinite(year) ||
        typeof month !== 'number' ||
        !Number.isFinite(month) ||
        typeof day !== 'number' ||
        !Number.isFinite(day)
    ) {
        return false;
    }

    // Check integer bounds for basic calendar validity
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return false;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    // Validate using native Date to account for leap years and month lengths (e.g. Feb 29)
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Calculates a start date by applying an offset to a base date string.
 * Ensures robust UTC handling, valid date bounds, and correct round-trip formatting.
 *
 * @param baseDateStr - The base date in 'YYYY-MM-DD' format.
 * @returns The adjusted date string in 'YYYY-MM-DD' format, or null if invalid.
 */
export function getStartDateWithOffset(baseDateStr: string): string | null {
    // Parse baseDateStr ('YYYY-MM-DD') using toDateObject
    const dateObjParts = toDateObject(baseDateStr);

    if (!dateObjParts) {
        return null;
    }

    const { year, month, day } = dateObjParts;
    const jsMonth = month - 1; // JS months are 0-indexed

    // Create UTC date object to prevent local timezone DST / offset issues during day addition
    const dateObj = new Date(Date.UTC(year, jsMonth, day));

    // NOTE: Checking isNaN(dateObj.getTime()) is omitted here because
    // toDateObject() already guarantees a valid date via isValidDate().

    // Add dayCount safely using setUTCDate
    dateObj.setUTCDate(dateObj.getUTCDate() + getDayOffset());

    // Re-verify the newly calculated date object is valid
    if (isNaN(dateObj.getTime())) {
        return null;
    }

    // Extract components and ensure round-trip integrity (prevents overflow issues like Feb 31 -> Mar 3)
    const resYear = dateObj.getUTCFullYear();
    const resMonth = dateObj.getUTCMonth();
    const resDay = dateObj.getUTCDate();

    // Format back to 'YYYY-MM-DD' using formatDate helper
    return formatDate(resYear, resMonth + 1, resDay);
}

/**
 * Gets the current local date and formats it as a "YYYY-MM-DD" date string.
 *
 * @returns The current date string in "YYYY-MM-DD" format.
 */
export function getCurrentDateString(): string {
    const now = new Date();
    return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
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

export function getTaskTimestamps({
    completionDate,
    dueDate,
    scheduledDate,
    fileNameDate,
    startTime,
    endTime,
}: TaskItem) {
    const chosenDate = chooseTaskDate(completionDate, dueDate, scheduledDate, fileNameDate);
    const dateObject = toDateObject(chosenDate);
    const startTimeObject = toTimeObject(startTime);
    const endTimeObject = toTimeObject(endTime);

    let start = NaN;
    let end = NaN;

    const defaultTime = { hour: 0, minute: 0 };

    if (dateObject !== null) {
        start = generateTimestamp({ ...dateObject, ...(startTimeObject ?? defaultTime) });
        end = generateTimestamp({ ...dateObject, ...(endTimeObject ?? defaultTime) });
    }

    return {
        start,
        end,
    };
}
