import { beforeEach, describe, expect, it } from 'vitest';
import { getProgress, markCaseCompleted, recordCheckpointAttempt } from '@/lib/storage';

function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    }
  };
}

describe('storage progress flow', () => {
  beforeEach(() => {
    const localStorage = createLocalStorageMock();
    // @ts-expect-error window mock for tests
    global.window = { localStorage };
  });

  it('records incorrect checkpoint attempts and increments weak tags', () => {
    const next = recordCheckpointAttempt({
      caseId: 'c1',
      checkpointId: 'cp1',
      answer: 'wrong',
      isCorrect: false,
      tags: ['central-miss-risk'],
      attemptedAt: '2026-01-01T00:00:00.000Z'
    });

    expect(next.checkpointHistory.length).toBe(1);
    expect(next.weakTagCounts['central-miss-risk']).toBe(1);
    expect(next.recommendedReviewQueue[0]).toBe('c1');
  });

  it('marks case complete once even if called repeatedly', () => {
    markCaseCompleted('c1');
    const afterRepeat = markCaseCompleted('c1');
    expect(afterRepeat.completedCaseIds).toEqual(['c1']);
  });

  it('returns default progress on empty storage', () => {
    const progress = getProgress();
    expect(progress.recommendedReviewQueue.length).toBeGreaterThan(0);
  });
});
