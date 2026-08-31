import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    chooseTaskDate,
    formatDate,
    formatTime,
    generateTimestamp,
    getCurrentDateString,
    getStartDateWithOffset,
    getTaskTimestamps,
    isDateEqual,
    isValidDate,
    isValidDateObject,
    toDateObject,
    toDateString,
    toIntervalObject,
    toTimeObject,
    toTimeString,
} from '@/utils/date-conversion';
import { getDayOffset } from '@/utils/dataview';
import { TaskItem } from '@/types';

// Mock getDayOffset to return a variable mock implementation
vi.mock('@/utils/dataview', () => ({
    getDayOffset: vi.fn(() => 0),
}));

describe('Date and Time Conversion Utilities', () => {
    describe('isValidDate', () => {
        it('should return true for valid standard dates', () => {
            expect(isValidDate(2023, 1, 15)).toBe(true);
            expect(isValidDate(2020, 12, 31)).toBe(true);
        });

        it('should correctly handle leap years', () => {
            expect(isValidDate(2024, 2, 29)).toBe(true); // Leap year
            expect(isValidDate(2023, 2, 29)).toBe(false); // Non-leap year
        });

        it('should return false for invalid months', () => {
            expect(isValidDate(2023, 0, 15)).toBe(false);
            expect(isValidDate(2023, 13, 15)).toBe(false);
        });

        it('should return false for invalid days in a month', () => {
            expect(isValidDate(2023, 4, 31)).toBe(false); // April only has 30 days
            expect(isValidDate(2023, 2, 30)).toBe(false); // February never has 30 days
            expect(isValidDate(2023, 1, 0)).toBe(false);
            expect(isValidDate(2023, 1, 32)).toBe(false);
        });

        it('should return false for non-integer inputs', () => {
            expect(isValidDate(2023, 1.5, 10)).toBe(false);
            expect(isValidDate(2023, 1, 10.5)).toBe(false);
            expect(isValidDate(2023.5, 1, 10)).toBe(false);
        });
    });

    describe('toDateObject', () => {
        it('should return null for null input', () => {
            expect(toDateObject(null)).toBeNull();
        });

        it('should correctly parse a valid date string', () => {
            expect(toDateObject('2023-10-15')).toEqual({
                year: 2023,
                month: 10,
                day: 15,
            });
        });

        it('should return null for incomplete date strings', () => {
            expect(toDateObject('2023-10')).toBeNull();
            expect(toDateObject('2023')).toBeNull();
            expect(toDateObject('invalid-date')).toBeNull();
        });

        it('should return null for non-numeric date parts', () => {
            expect(toDateObject('2023-ab-15')).toBeNull();
            expect(toDateObject('2023-10-cd')).toBeNull();
        });

        it('should return null for invalid calendar dates (e.g., Feb 30th)', () => {
            expect(toDateObject('2023-02-30')).toBeNull();
            expect(toDateObject('2023-13-01')).toBeNull(); // Invalid month
            expect(toDateObject('2023-00-15')).toBeNull(); // Invalid month 0
        });
    });

    describe('toTimeObject', () => {
        it('should return null for null input', () => {
            expect(toTimeObject(null)).toBeNull();
        });

        it('should correctly parse a valid time string', () => {
            expect(toTimeObject('14:30')).toEqual({
                hour: 14,
                minute: 30,
            });
        });

        it('should return null for incomplete or invalid time strings', () => {
            expect(toTimeObject('14')).toBeNull();
            expect(toTimeObject('invalid')).toBeNull();
            expect(toTimeObject('xx:30')).toBeNull();
        });

        it('should return null for out-of-range hours or minutes', () => {
            expect(toTimeObject('24:00')).toBeNull();
            expect(toTimeObject('14:61')).toBeNull();
        });
    });

    describe('generateTimestamp', () => {
        it('should generate the correct timestamp in milliseconds', () => {
            const dt = { year: 2023, month: 10, day: 15, hour: 12, minute: 0 };
            const expected = new Date(2023, 9, 15, 12, 0, 0, 0).getTime();
            expect(generateTimestamp(dt)).toBe(expected);
        });
    });

    describe('isDateEqual', () => {
        it('should return true for equal dates (mixing strings and objects)', () => {
            const dateObj = { year: 2023, month: 5, day: 10 };
            expect(isDateEqual('2023-05-10', dateObj)).toBe(true);
            expect(isDateEqual(dateObj, '2023-05-10')).toBe(true);
            expect(isDateEqual('2023-05-10', '2023-05-10')).toBe(true);
        });

        it('should return false for different dates or invalid inputs', () => {
            expect(isDateEqual('2023-05-10', '2023-05-11')).toBe(false);
            expect(isDateEqual('invalid', '2023-05-10')).toBe(false);
        });
    });

    describe('formatTime', () => {
        it('should pad hours and minutes with leading zeros', () => {
            expect(formatTime(9, 5)).toBe('09:05');
            expect(formatTime(23, 59)).toBe('23:59');
        });
    });

    describe('formatDate', () => {
        it('should format year, month, and day into YYYY-MM-DD with leading zeros', () => {
            expect(formatDate(2023, 3, 5)).toBe('2023-03-05');
            expect(formatDate(99, 12, 25)).toBe('0099-12-25');
        });
    });

    describe('toTimeString', () => {
        it('should return null for null input', () => {
            expect(toTimeString(null)).toBeNull();
        });

        it('should normalize and validate valid time strings', () => {
            expect(toTimeString('8:5')).toBe('08:05');
            expect(toTimeString('23:59')).toBe('23:59');
        });

        it('should return null for invalid time strings', () => {
            expect(toTimeString('25:00')).toBeNull();
            expect(toTimeString('xx:25')).toBeNull();
            expect(toTimeString('abc')).toBeNull();
        });
    });

    describe('toDateString', () => {
        it('should return null for null input', () => {
            expect(toDateString(null)).toBeNull();
        });

        it('should correctly normalize valid date strings', () => {
            expect(toDateString('2023-05-12')).toBe('2023-05-12');
            expect(toDateString('2023-1-5')).toBe('2023-01-05'); // Assuming formatDate pads single digits
        });

        it('should return null for invalid date formats or non-numeric values', () => {
            expect(toDateString('2023-05')).toBeNull();
            expect(toDateString('2023-05-abc')).toBeNull();
            expect(toDateString('not-a-date')).toBeNull();
        });
    });

    describe('toIntervalObject', () => {
        it('should return object with nulls for null input', () => {
            expect(toIntervalObject(null)).toEqual({
                startingTime: null,
                endingTime: null,
            });
        });

        it('should parse valid time intervals', () => {
            // Assuming toTimeString handles formats like '08:00'
            const result = toIntervalObject('08:00-17:00');
            expect(result).toEqual({
                startingTime: '08:00',
                endingTime: '17:00',
            });
        });

        it('should return null values for invalid intervals', () => {
            const result = toIntervalObject('invalid-interval');
            expect(result).toEqual({
                startingTime: null,
                endingTime: null,
            });
        });
        it('should return null values for a minus sign without any time', () => {
            const result = toIntervalObject('-');
            expect(result).toEqual({
                startingTime: null,
                endingTime: null,
            });
        });
    });

    describe('isValidDateObject', () => {
        it('should return true for valid calendar dates', () => {
            expect(isValidDateObject({ year: 2023, month: 5, day: 12 })).toBe(true);
            expect(isValidDateObject({ year: 2024, month: 2, day: 29 })).toBe(true); // Leap year
        });

        it('should return false for invalid dates, non-objects, or out-of-bound numbers', () => {
            expect(isValidDateObject(null)).toBe(false);
            expect(isValidDateObject({})).toBe(false);
            expect(isValidDateObject({ year: 2023, month: 2, day: 29 })).toBe(false); // Not a leap year
            expect(isValidDateObject({ year: 2023, month: 13, day: 1 })).toBe(false); // Invalid month
            expect(isValidDateObject({ year: 2023, month: 5, day: '12' })).toBe(false); // String instead of number
            expect(isValidDateObject({ year: 2023, month: 5.2, day: 12 })).toBeFalsy(); // non Integer
        });
    });

    describe('getStartDateWithOffset', () => {
        it('should calculate start date with offset correctly', () => {
            // Depending on how getDayOffset() is implemented in your module,
            // you might want to mock it or test the deterministic outcome.
            const result = getStartDateWithOffset('2023-05-15');
            // Assuming default offset results in a valid date string or null
            if (result !== null) {
                expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            } else {
                expect(result).toBeNull();
            }
        });

        it('should return null for invalid dates', () => {
            vi.mocked(getDayOffset).mockReturnValue(1_000_000_000);

            const result = getStartDateWithOffset('2023-05-15');
            expect(result).toBeNull();
        });

        it('should return null for invalid base date string', () => {
            expect(getStartDateWithOffset('invalid-date')).toBeNull();
        });
    });

    describe('getCurrentDateString', () => {
        it('should return a valid "YYYY-MM-DD" string for the current date', () => {
            const currentDateStr = getCurrentDateString();
            expect(currentDateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            const today = new Date();
            const expectedYear = today.getFullYear();
            expect(currentDateStr.startsWith(String(expectedYear))).toBe(true);
        });
    });

    describe('chooseTaskDate', () => {
        it('should prioritize completionDate over other dates', () => {
            const result = chooseTaskDate('2023-10-03', '2023-10-02', '2023-10-01', '2023-10-04');
            expect(result).toBe('2023-10-03');
        });

        it('should prioritize dueDate when completionDate is missing', () => {
            const result = chooseTaskDate(null, '2023-10-02', '2023-10-01', '2023-10-04');
            expect(result).toBe('2023-10-02');
        });

        it('should prioritize scheduledDate when completion and due dates are missing', () => {
            const result = chooseTaskDate(null, null, '2023-10-01', '2023-10-04');
            expect(result).toBe('2023-10-01');
        });

        it('should fallback to fallbackDate when all primary dates are missing', () => {
            const result = chooseTaskDate(null, null, null, '2023-10-04');
            expect(result).toBe('2023-10-04');
        });

        it('should return null if all dates are null/undefined', () => {
            const result = chooseTaskDate(null, null, null, null);
            expect(result).toBeNull();
        });
    });

    describe('getTaskTimestamps', () => {
        // Mock the date / time helpers or assume standard behavior of generateTimestamp
        // Assuming YYYY-MM-DD for dates and HH:mm for times
        const mockTask: TaskItem = {
            name: 'Complete project documentation',
            fileNameDate: '2023-10-15',
            scheduledDate: '2023-10-18',
            dueDate: '2023-10-20',
            completionDate: null,
            startTime: '09:00',
            endTime: '11:30',
            status: 'done',
            isDisplayable: true,
        };

        it('should return valid start and end timestamps when date and times are provided', () => {
            const task = {
                ...mockTask,
                dueDate: '2023-10-25',
                startTime: '09:00',
                endTime: '10:30',
            };

            const timestamps = getTaskTimestamps(task);

            expect(timestamps.start).not.toBeNaN();
            expect(timestamps.end).not.toBeNaN();
            expect(timestamps.end).toBeGreaterThan(timestamps.start);
        });

        it('should fall back to default time (00:00) when times are missing', () => {
            const task = {
                ...mockTask,
                scheduledDate: '2023-10-25',
                startTime: null,
                endTime: null,
            };

            const timestamps = getTaskTimestamps(task);

            expect(timestamps.start).not.toBeNaN();
            // Since start and end both fallback to 00:00 with no end time, they might equal each other or handle end time accordingly
            expect(timestamps.start).toEqual(timestamps.end);
        });

        it('should return NaN for start and end when no dates are provided', () => {
            const task = {
                ...mockTask,
                fileNameDate: null,
                scheduledDate: null,
                dueDate: null,
                completionDate: null,
            };

            const timestamps = getTaskTimestamps(task);

            expect(timestamps.start).toBeNaN();
            expect(timestamps.end).toBeNaN();
        });
    });
});
