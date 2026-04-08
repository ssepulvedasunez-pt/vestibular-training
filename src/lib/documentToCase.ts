import type { Checkpoint, TrainingCase } from '@/types/case';

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function pickTitle(lines: string[]) {
  const explicit = lines.find((line) => /^case\s*[:\-]/i.test(line));
  if (explicit) return explicit.replace(/^case\s*[:\-]\s*/i, '').trim();
  return lines[0] || 'Imported vestibular case';
}

function pickReveals(lines: string[]) {
  const revealLines = lines
    .filter((line) => /^reveal\s*[:\-]/i.test(line) || /^step\s*\d+\s*[:\-]/i.test(line))
    .map((line) => line.replace(/^(reveal|step\s*\d+)\s*[:\-]\s*/i, '').trim())
    .filter(Boolean);

  if (revealLines.length > 0) return revealLines.slice(0, 3);

  const sentenceChunks = lines
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 15);

  return sentenceChunks.slice(0, 3).length > 0
    ? sentenceChunks.slice(0, 3)
    : ['Symptoms evolve over time; collect each reveal before committing.'];
}

function pickCheckpointPrompts(lines: string[]) {
  const questions = lines.filter((line) => line.includes('?')).slice(0, 3);
  if (questions.length > 0) return questions;

  return [
    'What is the most likely syndrome classification?',
    'What is the highest-yield next bedside action?',
    'What is the key danger if this is misclassified?'
  ];
}

function pickOptionLines(lines: string[]) {
  return lines
    .filter((line) => /^([A-D][\).]|[-*])\s+/i.test(line))
    .map((line) => line.replace(/^([A-D][\).]|[-*])\s+/i, '').trim())
    .filter(Boolean)
    .slice(0, 6);
}

function inferTags(prompt: string, lines: string[]) {
  const joined = `${prompt} ${lines.join(' ')}`.toLowerCase();
  const tags = new Set<string>();

  if (/(central|stroke|skew|ataxia)/.test(joined)) tags.add('central-miss-risk');
  if (/(hints|head impulse|skew)/.test(joined)) tags.add('hints-use');
  if (/(residual|post-treatment|persistent)/.test(joined)) tags.add('residual-dizziness-misclassification');
  if (/(retest|re-test|repeat test)/.test(joined)) tags.add('failure-to-retest');

  if (tags.size === 0) tags.add('syndrome-misclassification');
  return [...tags];
}

function pickExplicitAnswer(lines: string[]) {
  const explicit = lines.find((line) => /^answer\s*[:\-]/i.test(line));
  if (!explicit) return null;
  return explicit.replace(/^answer\s*[:\-]\s*/i, '').trim();
}

function buildCheckpoint(prompt: string, index: number, extractedOptions: string[], lines: string[]): Checkpoint {
  const lower = prompt.toLowerCase();
  const escalationPrompt = lower.includes('danger') || lower.includes('risk');
  const questionLooksChoice = /(which|what|best|select|choose)/i.test(prompt);
  const useOptions = extractedOptions.length >= 2 && questionLooksChoice;
  const explicitAnswer = pickExplicitAnswer(lines);

  const acceptedAnswers = useOptions
    ? [explicitAnswer || extractedOptions[0]]
    : escalationPrompt
      ? ['stroke risk', 'central risk']
      : ['acute vestibular syndrome', 'avs'];

  return {
    id: `cp-${index + 1}`,
    prompt,
    type: useOptions ? 'single-best-answer' : 'short-text',
    options: useOptions ? extractedOptions : undefined,
    acceptedAnswers,
    correctFeedback: escalationPrompt
      ? 'Correct. You identified the safety-critical risk and why escalation may be needed.'
      : 'Good reasoning. Confirm syndrome classification before narrowing management.',
    incorrectFeedback: escalationPrompt
      ? 'Re-check the central-risk implications and escalation thresholds in this scenario.'
      : 'Re-check syndrome bucket and central-risk implications before committing to maneuvers.',
    dangerNote: 'Early misclassification can lead to unsafe reassurance and delayed escalation.',
    tags: inferTags(prompt, lines)
  };
}

export function parseDocumentToCase(sourceText: string): TrainingCase {
  const lines = sourceText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const title = pickTitle(lines);
  const caseIdBase = toSlug(title) || `imported-case-${Date.now()}`;
  const reveals = pickReveals(lines);
  const prompts = pickCheckpointPrompts(lines);
  const extractedOptions = pickOptionLines(lines);

  const presentation =
    lines.find((line) => /present|history|chief complaint|admitted|reports/i.test(line)) ||
    reveals[0] ||
    'Imported case from source document.';

  return {
    id: caseIdBase,
    title,
    moduleId: 'module-1',
    difficulty: 'intermediate',
    presentation,
    reveals,
    checkpoints: prompts.map((prompt, index) => buildCheckpoint(prompt, index, extractedOptions, lines))
  };
}
