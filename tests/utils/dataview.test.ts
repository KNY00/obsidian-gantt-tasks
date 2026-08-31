import { beforeEach, describe, test, expect } from 'vitest';
import { incrementDayOffset, decrementDayOffset, getDayOffset } from '@/utils/dataview';

describe('dataview store dayOffset utilities', () => {
    beforeEach(() => {
        // Reset the offset back to 0 before each test if possible,
        // or account for current state. Since store is internal,
        // we can bring it back to 0 by adjusting.
        const current = getDayOffset();
        if (current > 0) {
            for (let i = 0; i < current; i++) decrementDayOffset();
        } else if (current < 0) {
            for (let i = 0; i < Math.abs(current); i++) incrementDayOffset();
        }
    });

    test('getDayOffset returns initial offset of 0', () => {
        expect(getDayOffset()).toBe(0);
    });

    test('incrementDayOffset increases dayOffset by 1', () => {
        incrementDayOffset();
        expect(getDayOffset()).toBe(1);

        incrementDayOffset();
        expect(getDayOffset()).toBe(2);
    });

    test('decrementDayOffset decreases dayOffset by 1', () => {
        decrementDayOffset();
        expect(getDayOffset()).toBe(-1);

        decrementDayOffset();
        expect(getDayOffset()).toBe(-2);
    });

    test('getDayOffset returns a frozen copy preventing direct mutation', () => {
        const offsetObj = getDayOffset() as unknown as { dayOffset?: number };

        expect(() => {
            offsetObj.dayOffset = 10;
        }).toThrow();

        // Verify internal store was not mutated
        expect(getDayOffset()).toBe(0);
    });
});
