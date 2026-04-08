import type { CheckpointAttempt, Progress } from '@/types/progress';
import { updateReviewQueue } from '@/lib/progression';

const STORAGE_KEY = 'vestibular_trainer_progress_v1';

const EMPTY_PROGRESS: Progress = {
  completedCaseIds: [],
  checkpointHistory: [],
  weakTagCounts: {},
  recommendedReviewQueue: ['module1-case01']
};

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getProgress(): Progress {
  if (!hasWindow()) return EMPTY_PROGRESS;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_PROGRESS;

  try {
    const parsed = JSON.parse(raw) as Progress;
    return {
      ...EMPTY_PROGRESS,
      ...parsed,
      completedCaseIds: parsed.completedCaseIds ?? [],
      checkpointHistory: parsed.checkpointHistory ?? [],
      weakTagCounts: parsed.weakTagCounts ?? {},
      recommendedReviewQueue: parsed.recommendedReviewQueue ?? []
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordCheckpointAttempt(attempt: CheckpointAttempt): Progress {
  const current = getProgress();
  const nextWeakTags = { ...current.weakTagCounts };

  if (!attempt.isCorrect) {
    attempt.tags.forEach((tag) => {
      nextWeakTags[tag] = (nextWeakTags[tag] ?? 0) + 1;
    });
  }

  const next: Progress = {
    ...current,
    checkpointHistory: [...current.checkpointHistory, attempt],
    weakTagCounts: nextWeakTags,
    recommendedReviewQueue: updateReviewQueue(
      current.recommendedReviewQueue,
      attempt.caseId,
      attempt.isCorrect,
      attempt.tags
    )
  };

  saveProgress(next);
  return next;
}

export function markCaseCompleted(caseId: string): Progress {
  const current = getProgress();
  const completed = new Set(current.completedCaseIds);
  completed.add(caseId);

  const next: Progress = {
    ...current,
    completedCaseIds: [...completed]
  };

  saveProgress(next);
  return next;
}
