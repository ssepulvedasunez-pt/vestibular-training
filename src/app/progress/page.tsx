'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProgress } from '@/lib/storage';
import type { Progress } from '@/types/progress';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const topWeakTags = useMemo(() => {
    if (!progress) return [];
    return Object.entries(progress.weakTagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [progress]);

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Completed cases</p>
          <p className="mt-1 text-2xl font-semibold">{progress?.completedCaseIds.length ?? 0}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Checkpoint attempts</p>
          <p className="mt-1 text-2xl font-semibold">{progress?.checkpointHistory.length ?? 0}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Review queue size</p>
          <p className="mt-1 text-2xl font-semibold">{progress?.recommendedReviewQueue.length ?? 0}</p>
        </article>
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Top weak tags</h2>
        {topWeakTags.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No weak tags yet. Complete a case to generate data.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {topWeakTags.map(([tag, count]) => (
              <li className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm" key={tag}>
                <span>{tag}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="rounded-lg bg-slate-900 p-4 text-slate-100">
        <summary className="cursor-pointer font-semibold">Raw progress JSON</summary>
        <pre className="mt-3 overflow-x-auto text-xs">{JSON.stringify(progress, null, 2)}</pre>
      </details>
    </main>
  );
}
