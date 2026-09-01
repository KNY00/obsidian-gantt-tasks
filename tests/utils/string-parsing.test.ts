import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTokenAfterPrefix, dateFromTaskPath, _testing } from '@/utils/string-parsing';
import { toDateString } from '@/utils/date-conversion';

// Mock date conversion dependency to isolate string-parsing tests
vi.mock('@/utils/date-conversion', () => ({
    toDateString: vi.fn(),
}));

describe('string-parsing utilities', () => {
    describe('extractTokenAfterPrefix', () => {
        it('should return null if the prefix is not present in the source string', () => {
            const result = extractTokenAfterPrefix('Simple task text without prefix', '📅');
            expect(result).toBeNull();
        });

        it('should extract the token immediately following the prefix and a space', () => {
            const result = extractTokenAfterPrefix(
                'Task description 📅 2026-09-01 other details',
                '📅'
            );
            expect(result).toBe('2026-09-01');
        });

        it('should ignore multiple spaces between prefix and token', () => {
            const result = extractTokenAfterPrefix(
                'Task description ⏳   2026-10-15 next text',
                '⏳'
            );
            expect(result).toBe('2026-10-15');
        });

        it('should extract the token when it is at the very end of the string', () => {
            const result = extractTokenAfterPrefix('Task description ✅ 2026-12-31', '✅');
            expect(result).toBe('2026-12-31');
        });

        it('should extract the token when the prefix is at the start of the string', () => {
            const result = extractTokenAfterPrefix('🪓 08:00-12:00 Task with start prefix', '🪓');
            expect(result).toBe('08:00-12:00');
        });

        it('should return an empty string if there is no non-space token following the prefix', () => {
            const result = extractTokenAfterPrefix('Task description 📅   ', '📅');
            expect(result).toBe('');
        });

        it('should support multi-character string prefixes', () => {
            const result = extractTokenAfterPrefix('Task item due: 2026-11-05 rest', 'due:');
            expect(result).toBe('2026-11-05');
        });
    });

    describe('getFileTitle', () => {
        it('should extract the filename without extension from a standard unix path', () => {
            expect(_testing!.getFileTitle('vault/journals/2026-09-01.md')).toBe('2026-09-01');
        });

        it('should extract the filename without extension from a Windows backslash path', () => {
            expect(_testing!.getFileTitle('C:\\vault\\journals\\2026-09-01.md')).toBe('2026-09-01');
        });

        it('should return null when the path resolves to an empty string', () => {
            expect(_testing!.getFileTitle('')).toBeNull();
        });

        it('should return the full filename when there is no dot extension', () => {
            expect(_testing!.getFileTitle('vault/journals/DailyNote')).toBe('DailyNote');
        });

        it('should keep dots that are part of the filename before the last extension', () => {
            expect(_testing!.getFileTitle('vault/backup.daily.2026.md')).toBe('backup.daily.2026');
        });

        it('should handle standalone filenames with no directory segments', () => {
            expect(_testing!.getFileTitle('2026-09-01.md')).toBe('2026-09-01');
        });
    });

    describe('dateFromTaskPath', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should delegate extracted file title to toDateString and return the result', () => {
            vi.mocked(toDateString).mockReturnValue('2026-09-01');

            const result = dateFromTaskPath('vault/daily/2026-09-01.md');

            expect(toDateString).toHaveBeenCalledWith('2026-09-01');
            expect(result).toBe('2026-09-01');
        });

        it('should return null when toDateString returns null for non-date filenames', () => {
            vi.mocked(toDateString).mockReturnValue(null);

            const result = dateFromTaskPath('vault/daily/meeting-notes.md');

            expect(toDateString).toHaveBeenCalledWith('meeting-notes');
            expect(result).toBeNull();
        });

        it('should forward null to toDateString when the file path has no valid title', () => {
            vi.mocked(toDateString).mockReturnValue(null);

            const result = dateFromTaskPath('');

            expect(toDateString).toHaveBeenCalledWith(null);
            expect(result).toBeNull();
        });
    });
});
