import { describe, expect, it } from 'vitest';
import { validateTrainingCase } from '@/lib/caseValidation';
import type { TrainingCase } from '@/types/case';

const validCase: TrainingCase = {
  id: 'case-1',
  title: 'Test case',
  moduleId: 'module-1',
  difficulty: 'intro',
  presentation: 'Patient with continuous dizziness',
  reveals: ['Reveal 1'],
  checkpoints: [
    {
      id: 'cp-1',
      prompt: 'What syndrome?',
      type: 'short-text',
      acceptedAnswers: ['avs'],
      correctFeedback: 'Correct',
      incorrectFeedback: 'Incorrect',
      dangerNote: 'Danger',
      tags: ['central-miss-risk']
    }
  ]
};

describe('validateTrainingCase', () => {
  it('accepts valid cases', () => {
    const result = validateTrainingCase(validCase);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects missing required case fields', () => {
    const result = validateTrainingCase({ ...validCase, id: '', title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Case id is required.');
    expect(result.errors).toContain('Case title is required.');
  });

  it('rejects checkpoint without accepted answers', () => {
    const result = validateTrainingCase({
      ...validCase,
      checkpoints: [{ ...validCase.checkpoints[0], acceptedAnswers: [] }]
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((msg) => msg.includes('accepted answer'))).toBe(true);
  });

  it('rejects empty reveal, accepted answer, and tag values', () => {
    const result = validateTrainingCase({
      ...validCase,
      reveals: ['Reveal 1', ''],
      checkpoints: [
        {
          ...validCase.checkpoints[0],
          acceptedAnswers: ['avs', '   '],
          tags: ['central-miss-risk', '']
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Reveal entries cannot be empty.');
    expect(result.errors).toContain('Checkpoint 1: accepted answers cannot be empty.');
    expect(result.errors).toContain('Checkpoint 1: tags cannot be empty.');
  });

  it('accepts trimmed comma-separated style values when non-empty', () => {
    const result = validateTrainingCase({
      ...validCase,
      reveals: ['  Reveal 1  '],
      checkpoints: [
        {
          ...validCase.checkpoints[0],
          acceptedAnswers: [' avs '],
          tags: [' central-miss-risk ']
        }
      ]
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
