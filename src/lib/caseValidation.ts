import type { TrainingCase } from '@/types/case';

export type CaseValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateTrainingCase(trainingCase: TrainingCase): CaseValidationResult {
  const errors: string[] = [];

  if (!trainingCase.id?.trim()) errors.push('Case id is required.');
  if (!trainingCase.title?.trim()) errors.push('Case title is required.');
  if (!trainingCase.presentation?.trim()) errors.push('Case presentation is required.');
  if (!Array.isArray(trainingCase.reveals) || trainingCase.reveals.length === 0) {
    errors.push('At least one reveal is required.');
  } else if (trainingCase.reveals.some((reveal) => !reveal?.trim())) {
    errors.push('Reveal entries cannot be empty.');
  }

  if (!Array.isArray(trainingCase.checkpoints) || trainingCase.checkpoints.length === 0) {
    errors.push('At least one checkpoint is required.');
  }

  trainingCase.checkpoints.forEach((checkpoint, index) => {
    const prefix = `Checkpoint ${index + 1}`;
    if (!checkpoint.id?.trim()) errors.push(`${prefix}: id is required.`);
    if (!checkpoint.prompt?.trim()) errors.push(`${prefix}: prompt is required.`);
    if (!Array.isArray(checkpoint.acceptedAnswers) || checkpoint.acceptedAnswers.length === 0) {
      errors.push(`${prefix}: at least one accepted answer is required.`);
    } else if (checkpoint.acceptedAnswers.some((answer) => !answer?.trim())) {
      errors.push(`${prefix}: accepted answers cannot be empty.`);
    }
    if (!checkpoint.correctFeedback?.trim()) errors.push(`${prefix}: correct feedback is required.`);
    if (!checkpoint.incorrectFeedback?.trim()) errors.push(`${prefix}: incorrect feedback is required.`);
    if (!Array.isArray(checkpoint.tags) || checkpoint.tags.length === 0) {
      errors.push(`${prefix}: at least one tag is required.`);
    } else if (checkpoint.tags.some((tag) => !tag?.trim())) {
      errors.push(`${prefix}: tags cannot be empty.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
