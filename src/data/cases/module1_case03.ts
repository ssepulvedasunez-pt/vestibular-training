import type { TrainingCase } from '@/types/case';

export const module1Case03: TrainingCase = {
  id: 'module1-case03',
  title: 'Post-treatment persistent disequilibrium',
  moduleId: 'module-1',
  difficulty: 'intermediate',
  presentation: 'After successful positional treatment, patient reports mild persistent unsteadiness without recurrent spins.',
  reveals: [
    'Positional retest is negative for recurrent nystagmus.',
    'Symptoms are mild, non-spinning, and improve over days.'
  ],
  checkpoints: [
    {
      id: 'cp-1',
      prompt: 'What explanation rises first here?',
      type: 'single-best-answer',
      options: ['Residual dizziness', 'Untreated AVS', 'Central positional syndrome'],
      acceptedAnswers: ['Residual dizziness'],
      correctFeedback: 'Correct. Pattern fits residual dizziness after successful treatment.',
      incorrectFeedback: 'Given negative positional retest, persistent severe central concern is less likely as first explanation.',
      dangerNote: 'Ignoring retest data can cause unnecessary retreatment loops.',
      tags: ['failure-to-retest', 'residual-dizziness-misclassification']
    }
  ]
};
