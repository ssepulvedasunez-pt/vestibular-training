export type CheckpointAttempt = {
  caseId: string;
  checkpointId: string;
  answer: string;
  isCorrect: boolean;
  tags: string[];
  attemptedAt: string;
};

export type Progress = {
  completedCaseIds: string[];
  checkpointHistory: CheckpointAttempt[];
  weakTagCounts: Record<string, number>;
  recommendedReviewQueue: string[];
};
