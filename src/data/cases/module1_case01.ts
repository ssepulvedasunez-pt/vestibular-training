import type { TrainingCase } from '@/types/case';

export const module1Case01: TrainingCase = {
  id: 'module1-case01',
  title: 'Acute continuous dizziness with gait instability',
  moduleId: 'module-1',
  difficulty: 'intro',
  presentation:
    '67-year-old admitted for sudden persistent vertigo, nausea, and unsteady gait since this morning.',
  reveals: [
    'Symptoms are continuous at rest and not only provoked by specific position changes.',
    'Spontaneous left-beating nystagmus is present during fixation-removed observation.'
  ],
  checkpoints: [
    {
      id: 'cp-1',
      prompt: 'Which syndrome bucket is most appropriate before further exam details?',
      type: 'single-best-answer',
      options: ['Acute vestibular syndrome', 'Triggered episodic vestibular syndrome', 'Residual dizziness'],
      acceptedAnswers: ['Acute vestibular syndrome'],
      correctFeedback:
        'Correct. Continuous dizziness at rest with spontaneous nystagmus supports AVS framing first.',
      incorrectFeedback:
        'This pattern is not a classic triggered episodic picture; anchoring on positional syndromes is risky here.',
      dangerNote: 'Misclassification can lead to under-triage of possible central pathology.',
      tags: ['syndrome-misclassification', 'central-miss-risk']
    },
    {
      id: 'cp-2',
      prompt: 'What is the highest-yield next bedside reasoning pathway?',
      type: 'short-text',
      acceptedAnswers: ['hints', 'hints exam', 'hints plus hearing'],
      correctFeedback:
        'Correct. AVS framework with trained HINTS-level exam and escalation logic is the next step.',
      incorrectFeedback:
        'Move through AVS triage first before positional maneuver pathways to reduce false reassurance.',
      dangerNote: 'Skipping AVS triage may delay central red-flag recognition.',
      tags: ['hints-use', 'central-miss-risk']
    }
  ]
};
