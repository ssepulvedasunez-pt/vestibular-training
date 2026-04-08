'use client';

import { useMemo, useState } from 'react';
import type { TrainingCase } from '@/types/case';
import { isAnswerCorrect } from '@/lib/scoring';
import { markCaseCompleted, recordCheckpointAttempt } from '@/lib/storage';
import { nextCaseQueue } from '@/lib/progression';
import { normalizeAnswer } from '@/lib/answerMatch';
import { FeedbackPanel } from '@/components/FeedbackPanel';

export function CasePlayer({ trainingCase }: { trainingCase: TrainingCase }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [nextQueuePreview, setNextQueuePreview] = useState<string[]>([]);

  const checkpoint = trainingCase.checkpoints[step];
  const answer = answers[checkpoint.id] ?? '';
  const isSubmitted = submitted[checkpoint.id] ?? false;

  const correct = useMemo(() => {
    if (!isSubmitted) return false;
    return isAnswerCorrect(normalizeAnswer(answer), checkpoint.acceptedAnswers.map(normalizeAnswer));
  }, [answer, checkpoint.acceptedAnswers, isSubmitted]);

  const isFinalCheckpoint = step === trainingCase.checkpoints.length - 1;

  function handleCommit() {
    if (!answer) return;

    const isCorrect = isAnswerCorrect(normalizeAnswer(answer), checkpoint.acceptedAnswers.map(normalizeAnswer));

    setSubmitted((prev) => ({ ...prev, [checkpoint.id]: true }));

    recordCheckpointAttempt({
      caseId: trainingCase.id,
      checkpointId: checkpoint.id,
      answer,
      isCorrect,
      tags: checkpoint.tags,
      attemptedAt: new Date().toISOString()
    });

    if (isFinalCheckpoint) {
      markCaseCompleted(trainingCase.id);
      setNextQueuePreview(nextCaseQueue([trainingCase.id, 'module1-case02'], !isCorrect));
    }
  }

  function handleNext() {
    if (!isSubmitted || isFinalCheckpoint) return;
    setStep((prev) => prev + 1);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-white p-4 shadow-sm" aria-labelledby="case-reveal-heading">
        <h2 id="case-reveal-heading" className="text-lg font-semibold">Case reveal</h2>
        <p className="mt-2 text-sm text-slate-700">{trainingCase.reveals[Math.min(step, trainingCase.reveals.length - 1)]}</p>
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm" aria-labelledby="checkpoint-heading">
        <p className="text-xs uppercase tracking-wide text-slate-500">Checkpoint {step + 1}</p>
        <h3 id="checkpoint-heading" className="mt-1 text-lg font-semibold">{checkpoint.prompt}</h3>

        {checkpoint.type === 'single-best-answer' ? (
          <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Answer choices">
            {checkpoint.options?.map((option) => {
              const active = option === answer;
              return (
                <button
                  type="button"
                  key={option}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAnswers((prev) => ({ ...prev, [checkpoint.id]: option }))}
                  className={`rounded-md border px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 ${
                    active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            className="mt-3 w-full rounded-md border border-slate-300 p-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
            rows={4}
            aria-label="Short answer"
            value={answer}
            onChange={(event) => setAnswers((prev) => ({ ...prev, [checkpoint.id]: event.target.value }))}
            placeholder="Enter your answer"
          />
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleCommit}
            disabled={!answer || isSubmitted}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
          >
            Commit answer
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isSubmitted || isFinalCheckpoint}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
          >
            Next checkpoint
          </button>
        </div>
      </section>

      <div role="status" aria-live="polite">
        {isSubmitted ? <FeedbackPanel checkpoint={checkpoint} isCorrect={correct} /> : null}
      </div>

      {isFinalCheckpoint && isSubmitted ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status" aria-live="polite">
          <p className="font-semibold">Case complete</p>
          <p className="mt-1">Recommended queue: {nextQueuePreview.join(' → ') || 'module1-case01 → module1-case02'}</p>
        </section>
      ) : null}
    </div>
  );
}
