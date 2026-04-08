export type Module = {
  id: string;
  title: string;
  description: string;
};

export const modules: Module[] = [
  {
    id: 'module-1',
    title: 'Syndrome classification',
    description: 'Differentiate AVS, tEVS, post-BPPV residual dizziness, UVH, and central causes.'
  },
  {
    id: 'module-2',
    title: 'Central red flags and AVS triage',
    description: 'Apply HINTS constraints, truncal ataxia, hearing caveats, and escalation logic.'
  },
  {
    id: 'module-3',
    title: 'BPPV mechanics and pattern recognition',
    description: 'Identify canal, side, and mechanism with geotropic/apogeotropic interpretation.'
  }
];
