export type CheckpointType = 'single-best-answer' | 'multi-select' | 'short-text' | 'rank-order' | 'next-step';

export type Checkpoint = {
  id: string;
  prompt: string;
  type: CheckpointType;
  options?: string[];
  acceptedAnswers: string[];
  correctFeedback: string;
  incorrectFeedback: string;
  dangerNote?: string;
  tags: string[];
};

export type TrainingCase = {
  id: string;
  title: string;
  moduleId: string;
  difficulty: 'intro' | 'intermediate' | 'advanced';
  presentation: string;
  reveals: string[];
  checkpoints: Checkpoint[];
};
