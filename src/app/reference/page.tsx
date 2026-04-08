import { referenceCards } from '@/data/reference/cards';

export default function ReferencePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Reference Library</h1>
      <div className="space-y-3">
        {referenceCards.map((card) => (
          <article className="rounded-lg bg-white p-4 shadow-sm" key={card.id}>
            <h2 className="font-semibold">{card.title}</h2>
            <ul className="mt-2 list-disc pl-6 text-slate-700">
              {card.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
