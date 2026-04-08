export type ReferenceCard = {
  id: string;
  title: string;
  bullets: string[];
};

export const referenceCards: ReferenceCard[] = [
  {
    id: 'avs-triage',
    title: 'AVS bedside triage',
    bullets: [
      'Confirm continuous symptoms and spontaneous nystagmus pattern before applying bedside logic.',
      'Treat severe truncal ataxia and focal deficits as escalation triggers.',
      'Use HINTS only in the proper AVS context and with adequate examiner skill.'
    ]
  },
  {
    id: 'bppv-pattern-map',
    title: 'BPPV pattern map',
    bullets: [
      'Posterior canal: upbeat torsional toward dependent ear.',
      'Horizontal geotropic: stronger on affected side for canalithiasis.',
      'Horizontal apogeotropic: consider cupulolithiasis or contralateral canalithiasis.'
    ]
  }
];
