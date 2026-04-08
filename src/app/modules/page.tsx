import { modules } from '@/data/modules';

export default function ModulesPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Modules</h1>
      <div className="space-y-3">
        {modules.map((module) => (
          <article className="rounded-lg bg-white p-4 shadow-sm" key={module.id}>
            <h2 className="font-semibold">{module.title}</h2>
            <p className="text-slate-600">{module.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
