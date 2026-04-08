import type { Checkpoint } from '@/types/case';

export function FeedbackPanel({ checkpoint, isCorrect }: { checkpoint: Checkpoint; isCorrect: boolean }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold">{isCorrect ? 'Expert feedback' : 'Correction'}</h2>
      <p className="mt-2 text-sm text-slate-700">
        {isCorrect ? checkpoint.correctFeedback : checkpoint.incorrectFeedback}
      </p>
      {checkpoint.dangerNote ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">Why this matters</p>
          <p className="mt-1">{checkpoint.dangerNote}</p>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {checkpoint.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
