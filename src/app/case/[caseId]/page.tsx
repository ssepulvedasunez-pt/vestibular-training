'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CasePlayer } from '@/components/CasePlayer';
import { getSeedCases } from '@/lib/caseLoader';
import { getCaseByIdIncludingCustom } from '@/lib/customCaseStorage';
import type { TrainingCase } from '@/types/case';

export default function CasePage() {
  const params = useParams<{ caseId: string }>();
  const [foundCase, setFoundCase] = useState<TrainingCase | null>(null);

  useEffect(() => {
    if (!params?.caseId) return;
    const nextCase = getCaseByIdIncludingCustom(params.caseId, getSeedCases()) ?? null;
    setFoundCase(nextCase);
  }, [params?.caseId]);

  if (!foundCase) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Case not found</h1>
        <p className="mt-2 text-sm text-slate-700">Try creating one at /author or check the case id.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">{foundCase.title}</h1>
      <p className="text-slate-700">{foundCase.presentation}</p>
      <CasePlayer trainingCase={foundCase} />
    </main>
  );
}
