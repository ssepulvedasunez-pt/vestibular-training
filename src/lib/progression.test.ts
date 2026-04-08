import { describe, expect, it } from 'vitest';
import { nextCaseQueue, updateReviewQueue } from '@/lib/progression';

describe('nextCaseQueue', () => {
  it('keeps order when no dangerous miss', () => {
    expect(nextCaseQueue(['a', 'b', 'c'], false)).toEqual(['a', 'b', 'c']);
  });

  it('reverses order when dangerous miss occurred', () => {
    expect(nextCaseQueue(['a', 'b', 'c'], true)).toEqual(['c', 'b', 'a']);
  });
});

describe('updateReviewQueue', () => {
  it('moves dangerous misses to front', () => {
    const next = updateReviewQueue(['x', 'y', 'z'], 'y', false, ['central-miss-risk']);
    expect(next[0]).toBe('y');
  });

  it('pushes non-dangerous misses to end', () => {
    const next = updateReviewQueue(['x', 'y'], 'x', false, ['wrong-side']);
    expect(next).toEqual(['y', 'x']);
  });

  it('removes correctly answered case from queue', () => {
    const next = updateReviewQueue(['x', 'y'], 'x', true, []);
    expect(next).toEqual(['y']);
  });
});
