import Link from 'next/link';
import { NavLinks } from '@/components/NavLinks';
import { modules } from '@/data/modules';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Vestibular Trainer</h1>
      <p className="text-slate-700">MVP shell focused on inpatient vestibular bedside reasoning.</p>
      <Link className="inline-block rounded-md bg-slate-900 px-3 py-2 text-sm text-white" href="/case/module1-case01">
        Start first case
      </Link>
      <NavLinks />
      <p className="text-xs text-slate-600">Need to create your own case? Go to the Author tab.</p>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Training Modules</h2>
        <ul className="space-y-2">
          {modules.map((module) => (
            <li key={module.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{module.title}</p>
              <p className="text-sm text-slate-600">{module.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
