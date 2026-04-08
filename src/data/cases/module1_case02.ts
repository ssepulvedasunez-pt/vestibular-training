import type { TrainingCase } from '@/types/case';

export const module1Case02: TrainingCase = {
  id: 'module1-case02',
  title: 'Triggered dizziness with positional pattern',
  moduleId: 'module-1',
  difficulty: 'intro',
  presentation: '58-year-old with brief vertigo spells triggered by bed turns; asymptomatic at rest.',
  reveals: [
    'Episodes are brief and consistently triggered by positional change.',
    'No continuous spontaneous nystagmus between episodes.'
  ],
  checkpoints: [
    {
      id: 'cp-1',
      prompt: 'What syndrome bucket best fits this presentation?',
      type: 'single-best-answer',
      options: ['Triggered episodic vestibular syndrome', 'Acute vestibular syndrome', 'Residual dizziness'],
      acceptedAnswers: ['Triggered episodic vestibular syndrome'],
      correctFeedback: 'Correct. Triggered brief episodes at position change support a triggered episodic bucket.',
      incorrectFeedback: 'Continuous AVS framing is less likely when symptoms are brief and trigger-bound.',
      dangerNote: 'Misclassification can lead to incorrect exam sequencing and unnecessary escalation.',
      tags: ['syndrome-misclassification']
    }
  ]
};
