import { describe, expect, it } from 'vitest';
import { parseDocumentToCase } from '@/lib/documentToCase';

describe('parseDocumentToCase', () => {
  it('extracts multiple checkpoint prompts from question lines', () => {
    const source = `Case: AVS consult\nPatient reports continuous vertigo.\nWhat syndrome fits best?\nWhat is the next best test?\nWhat central risk matters most?`;
    const parsed = parseDocumentToCase(source);

    expect(parsed.title).toBe('AVS consult');
    expect(parsed.checkpoints.length).toBe(3);
    expect(parsed.checkpoints[0].prompt).toContain('What syndrome fits best?');
  });

  it('falls back to default prompts when none are present', () => {
    const source = 'Case: No question source\nPatient reports dizziness at rest.';
    const parsed = parseDocumentToCase(source);

    expect(parsed.checkpoints.length).toBe(3);
    expect(parsed.checkpoints[0].prompt).toContain('most likely syndrome');
  });

  it('extracts answer options when list markers exist', () => {
    const source = `Case: Option case\nWhich diagnosis is most likely?\nA) Acute vestibular syndrome\nB) BPPV\nC) Vestibular migraine`;
    const parsed = parseDocumentToCase(source);

    expect(parsed.checkpoints[0].type).toBe('single-best-answer');
    expect(parsed.checkpoints[0].options).toEqual([
      'Acute vestibular syndrome',
      'BPPV',
      'Vestibular migraine'
    ]);
    expect(parsed.checkpoints[0].acceptedAnswers[0]).toBe('Acute vestibular syndrome');
  });

  it('uses explicit answer line when provided', () => {
    const source = `Case: Explicit answer\nWhich diagnosis is most likely?\nA) Acute vestibular syndrome\nB) BPPV\nAnswer: BPPV`;
    const parsed = parseDocumentToCase(source);

    expect(parsed.checkpoints[0].acceptedAnswers[0]).toBe('BPPV');
  });

  it('infers central-risk tags from source content', () => {
    const source = `Case: Central caution\nWhat central risk matters most?\nPatient has severe ataxia and possible stroke concern.`;
    const parsed = parseDocumentToCase(source);

    expect(parsed.checkpoints[0].tags).toContain('central-miss-risk');
  });
});
