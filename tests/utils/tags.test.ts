import { describe, it, expect } from 'vitest';
import { hasAllTags, removeTags } from '@/utils/tags';
import { _testing } from '@/utils/tags';

describe('tags utility functions', () => {
    describe('tagStringToArray', () => {
        it('should remove empty elements when a trailing comma is provided (e.g., "#tag,")', () => {
            const input = '#tag,';
            const result = _testing!.tagStringToArray(input);

            // Verifies that the second empty tag is removed and only '#tag' remains
            expect(result).toEqual(['#tag']);
        });

        it('should filter out multiple empty slots and trim surrounding whitespace', () => {
            const input = '#tag1, , #tag2, ';
            const result = _testing!.tagStringToArray(input);

            expect(result).toEqual(['#tag1', '#tag2']);
        });
    });
    describe('hasAllTags', () => {
        it('should return true when a single specified tag is present in the line', () => {
            const line = '- [ ] Buy groceries #todo';
            const tagStr = '#todo';

            expect(hasAllTags(line, tagStr)).toBe(true);
        });

        it('should return false when a single specified tag is missing from the line', () => {
            const line = '- [ ] Buy groceries #errand';
            const tagStr = '#todo';

            expect(hasAllTags(line, tagStr)).toBe(false);
        });

        it('should return true when all comma-separated tags are present in the line', () => {
            const line = '- [ ] Update documentation #work #urgent #docs';
            const tagStr = '#work, #urgent, #docs';

            expect(hasAllTags(line, tagStr)).toBe(true);
        });

        it('should return true when all comma-separated tags are present in the line (order independent)', () => {
            const line = '- [ ] Update documentation #work #urgent #docs';
            const tagStr = '#work, #docs, #urgent';

            expect(hasAllTags(line, tagStr)).toBe(true);
        });

        it('should return false when at least one comma-separated tag is missing from the line', () => {
            const line = '- [ ] Update documentation #work #docs';
            const tagStr = '#work, #urgent, #docs';

            expect(hasAllTags(line, tagStr)).toBe(false);
        });

        it('should trim surrounding whitespace in comma-separated tag items before matching', () => {
            const line = '- [ ] Finish report #project #final';
            const tagStr = '  #project ,   #final  ';

            expect(hasAllTags(line, tagStr)).toBe(true);
        });

        it('should return true when given an empty tag string because every string includes empty substrings', () => {
            const line = '- [ ] Some generic task';
            const tagStr = '';

            expect(hasAllTags(line, tagStr)).toBe(true);
        });
    });

    describe('removeTags', () => {
        it('should remove a single tag and trim trailing whitespace', () => {
            const line = '- [ ] Clean bedroom #chore';
            const tagStr = '#chore';

            expect(removeTags(line, tagStr)).toBe('- [ ] Clean bedroom');
        });

        it('should remove multiple comma-separated tags from the line', () => {
            const line = '- [ ] Review PR #code #review';
            const tagStr = '#code, #review';

            expect(removeTags(line, tagStr)).toBe('- [ ] Review PR');
        });

        it('should handle comma-separated tags with extra spaces properly', () => {
            const line = '- [ ] Plan sprint #planning #team';
            const tagStr = ' #planning ,  #team ';

            expect(removeTags(line, tagStr)).toBe('- [ ] Plan sprint');
        });

        it('should leave the line unchanged if none of the specified tags exist', () => {
            const line = '- [ ] Write unit tests';
            const tagStr = '#nonexistent, #missing';

            expect(removeTags(line, tagStr)).toBe('- [ ] Write unit tests');
        });

        it('should only remove the first occurrence of each tag in the line', () => {
            const line = '- [ ] Duplicate tag #test #test';
            const tagStr = '#test';

            expect(removeTags(line, tagStr)).toBe('- [ ] Duplicate tag  #test');
        });

        it('should return the trimmed line when an empty tag string is provided', () => {
            const line = '- [ ] Task with trailing spaces   ';
            const tagStr = '';

            expect(removeTags(line, tagStr)).toBe('- [ ] Task with trailing spaces');
        });
    });
});
