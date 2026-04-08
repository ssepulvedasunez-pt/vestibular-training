'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import type { Checkpoint, TrainingCase } from '@/types/case';
import {
  exportCustomCaseBundle,
  getImportHistory,
  importCustomCaseBundle,
  previewBundleImport,
  saveCustomCase,
  type BundlePreview,
  type ImportHistoryEntry
} from '@/lib/customCaseStorage';
import { parseDocumentToCase } from '@/lib/documentToCase';
import { validateTrainingCase } from '@/lib/caseValidation';

const blankCheckpoint: Checkpoint = {
  id: 'cp-1',
  prompt: '',
  type: 'short-text',
  acceptedAnswers: [''],
  correctFeedback: '',
  incorrectFeedback: '',
  dangerNote: '',
  tags: ['']
};

const blankCase: TrainingCase = {
  id: '',
  title: '',
  moduleId: 'module-1',
  difficulty: 'intro',
  presentation: '',
  reveals: [''],
  checkpoints: [blankCheckpoint]
};

export default function AuthorPage() {
  const [draft, setDraft] = useState<TrainingCase>(blankCase);
  const [sourceText, setSourceText] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const [bundleAuthor, setBundleAuthor] = useState('');
  const [bundleSources, setBundleSources] = useState('');
  const [bundleModuleMap, setBundleModuleMap] = useState('');

  const [pendingBundleText, setPendingBundleText] = useState('');
  const [bundlePreview, setBundlePreview] = useState<BundlePreview | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([]);

  useEffect(() => {
    setImportHistory(getImportHistory());
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateTrainingCase(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      setMessage('Fix validation errors before saving.');
      return;
    }

    try {
      saveCustomCase(draft);
      setErrors([]);
      setMessage(`Saved case "${draft.id}" locally. Open /case/${draft.id} to play it.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save case.');
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    file
      .text()
      .then((text: string) => JSON.parse(text) as TrainingCase)
      .then((parsed: TrainingCase) => {
        setDraft(parsed);
        const validation = validateTrainingCase(parsed);
        setErrors(validation.errors);
        setMessage(validation.valid ? 'Uploaded JSON loaded into editor.' : 'Uploaded JSON loaded with validation issues.');
      })
      .catch(() => setMessage('Could not parse JSON file.'));
  }

  function handleGenerateFromSource() {
    if (!sourceText.trim()) {
      setMessage('Paste source text first, then click Generate Draft.');
      return;
    }

    const generated = parseDocumentToCase(sourceText);
    const validation = validateTrainingCase(generated);
    setDraft(generated);
    setErrors(validation.errors);
    setMessage('Generated a draft case from source text. Review/edit before saving.');
  }

  function handleExportBundle() {
    const json = exportCustomCaseBundle({
      author: bundleAuthor || undefined,
      sourceDocuments: bundleSources || undefined,
      moduleMapping: bundleModuleMap || undefined
    });

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vestibular-case-bundle.json';
    link.click();
    URL.revokeObjectURL(url);

    setMessage('Exported custom case bundle.');
  }

  function handleImportBundle(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    file
      .text()
      .then((text) => {
        const preview = previewBundleImport(text);
        setPendingBundleText(text);
        setBundlePreview(preview);
        setMessage('Bundle loaded. Review preview and confirm import.');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Failed to load bundle.'));
  }

  function handleConfirmImport() {
    if (!pendingBundleText) return;

    try {
      const merged = importCustomCaseBundle(pendingBundleText);
      setMessage(`Imported bundle. Total local cases: ${merged.length}.`);
      setPendingBundleText('');
      setBundlePreview(null);
      setImportHistory(getImportHistory());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to import bundle.');
    }
  }

  function updateCheckpoint(index: number, next: Partial<Checkpoint>) {
    setDraft((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.map((checkpoint, checkpointIndex) =>
        checkpointIndex === index ? { ...checkpoint, ...next } : checkpoint
      )
    }));
  }

  function addCheckpoint() {
    setDraft((prev) => ({
      ...prev,
      checkpoints: [...prev.checkpoints, { ...blankCheckpoint, id: `cp-${prev.checkpoints.length + 1}` }]
    }));
  }

  function removeCheckpoint(index: number) {
    setDraft((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, checkpointIndex) => checkpointIndex !== index)
    }));
  }

  function updateReveal(index: number, value: string) {
    setDraft((prev) => ({
      ...prev,
      reveals: prev.reveals.map((reveal, revealIndex) => (revealIndex === index ? value : reveal))
    }));
  }

  function addReveal() {
    setDraft((prev) => ({ ...prev, reveals: [...prev.reveals, ''] }));
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Case Authoring (MVP)</h1>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Generate draft from source document text</h2>
        <textarea
          className="w-full rounded border border-slate-300 p-2"
          rows={8}
          placeholder="Paste source text here..."
          aria-label="Source document text"
          value={sourceText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSourceText(event.target.value)}
        />
        <button className="rounded bg-slate-800 px-4 py-2 text-white" type="button" onClick={handleGenerateFromSource}>
          Generate draft from source
        </button>
      </section>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Share authored case bundles</h2>

        <input
          className="w-full rounded border border-slate-300 p-2 text-sm"
          placeholder="Bundle author (optional)"
          value={bundleAuthor}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setBundleAuthor(event.target.value)}
        />
        <input
          className="w-full rounded border border-slate-300 p-2 text-sm"
          placeholder="Source docs summary (optional)"
          value={bundleSources}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setBundleSources(event.target.value)}
        />
        <input
          className="w-full rounded border border-slate-300 p-2 text-sm"
          placeholder="Module mapping notes (optional)"
          value={bundleModuleMap}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setBundleModuleMap(event.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button className="rounded border px-3 py-2 text-sm" type="button" onClick={handleExportBundle}>
            Export local cases
          </button>
          <label className="rounded border px-3 py-2 text-sm">
            Import case bundle
            <input className="hidden" type="file" accept="application/json" onChange={handleImportBundle} />
          </label>
          <button
            className="rounded border px-3 py-2 text-sm"
            type="button"
            onClick={handleConfirmImport}
            disabled={!bundlePreview}
          >
            Confirm import
          </button>
        </div>

        {bundlePreview ? (
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold">Bundle preview</p>
            <p>Checksum: {bundlePreview.checksum}</p>
            <p>Signature valid: {bundlePreview.signatureValid ? 'Yes' : 'No'}</p>
            <p>Incoming cases: {bundlePreview.totalIncoming}</p>
            <p>New cases: {bundlePreview.newCases.join(', ') || 'None'}</p>
            <p>Conflicts (will overwrite): {bundlePreview.conflictingCases.join(', ') || 'None'}</p>
            {bundlePreview.metadata?.author ? <p>Author: {bundlePreview.metadata.author}</p> : null}
          </div>
        ) : null}

        {importHistory.length > 0 ? (
          <div className="rounded border border-slate-200 bg-white p-3 text-sm">
            <p className="font-semibold">Recent import history</p>
            <ul className="mt-2 space-y-1">
              {importHistory.map((entry) => (
                <li key={`${entry.importedAt}-${entry.checksum}`}>
                  {entry.importedAt}: {entry.importedCount} cases, checksum {entry.checksum}, signature{' '}
                  {entry.signatureValid ? 'valid' : 'invalid'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <label className="block text-sm font-medium text-slate-700">
        Upload case JSON
        <input className="mt-1 block w-full text-sm" type="file" accept="application/json" onChange={handleUpload} />
      </label>

      {errors.length > 0 ? (
        <section className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert" aria-live="assertive">
          <p className="font-semibold">Validation issues</p>
          <ul className="mt-2 list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <form className="space-y-4 rounded-lg bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-slate-300 p-2"
          placeholder="Case ID"
          aria-label="Case ID"
          value={draft.id}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((prev) => ({ ...prev, id: event.target.value }))}
        />
        <input
          className="w-full rounded border border-slate-300 p-2"
          placeholder="Title"
          aria-label="Case title"
          value={draft.title}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
        />
        <textarea
          className="w-full rounded border border-slate-300 p-2"
          rows={3}
          placeholder="Presentation summary"
          aria-label="Presentation summary"
          value={draft.presentation}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setDraft((prev) => ({ ...prev, presentation: event.target.value }))
          }
        />

        <section className="space-y-2 rounded border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Reveals</h3>
            <button className="rounded border px-2 py-1 text-xs" type="button" onClick={addReveal}>
              Add reveal
            </button>
          </div>
          {draft.reveals.map((reveal, index) => (
            <textarea
              key={`reveal-${index}`}
              className="w-full rounded border border-slate-300 p-2"
              rows={2}
              placeholder={`Reveal ${index + 1}`}
              value={reveal}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateReveal(index, event.target.value)}
            />
          ))}
        </section>

        <section className="space-y-3 rounded border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Checkpoints</h3>
            <button className="rounded border px-2 py-1 text-xs" type="button" onClick={addCheckpoint}>
              Add checkpoint
            </button>
          </div>

          {draft.checkpoints.map((checkpoint, index) => (
            <article key={checkpoint.id} className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Checkpoint {index + 1}</p>
                {draft.checkpoints.length > 1 ? (
                  <button className="rounded border px-2 py-1 text-xs" type="button" onClick={() => removeCheckpoint(index)}>
                    Remove
                  </button>
                ) : null}
              </div>

              <input
                className="w-full rounded border border-slate-300 p-2"
                placeholder="Checkpoint id"
                value={checkpoint.id}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateCheckpoint(index, { id: event.target.value })}
              />
              <textarea
                className="w-full rounded border border-slate-300 p-2"
                rows={2}
                placeholder="Checkpoint prompt"
                value={checkpoint.prompt}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateCheckpoint(index, { prompt: event.target.value })}
              />
              <input
                className="w-full rounded border border-slate-300 p-2"
                placeholder="Accepted answers (comma-separated)"
                value={checkpoint.acceptedAnswers.join(', ')}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateCheckpoint(index, {
                    acceptedAnswers: event.target.value.split(',').map((value) => value.trim())
                  })
                }
              />
              <input
                className="w-full rounded border border-slate-300 p-2"
                placeholder="Tags (comma-separated)"
                value={checkpoint.tags.join(', ')}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateCheckpoint(index, { tags: event.target.value.split(',').map((value) => value.trim()) })
                }
              />
              <textarea
                className="w-full rounded border border-slate-300 p-2"
                rows={2}
                placeholder="Correct feedback"
                value={checkpoint.correctFeedback}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  updateCheckpoint(index, { correctFeedback: event.target.value })
                }
              />
              <textarea
                className="w-full rounded border border-slate-300 p-2"
                rows={2}
                placeholder="Incorrect feedback"
                value={checkpoint.incorrectFeedback}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  updateCheckpoint(index, { incorrectFeedback: event.target.value })
                }
              />
            </article>
          ))}
        </section>

        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Save case locally
        </button>
      </form>

      {message ? (
        <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </main>
  );
}
