import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportCustomCaseBundle,
  getCustomCases,
  getImportHistory,
  importCustomCaseBundle,
  previewBundleImport,
  saveCustomCase
} from '@/lib/customCaseStorage';
import type { TrainingCase } from '@/types/case';

const validCase: TrainingCase = {
  id: 'saved-case-1',
  title: 'Saved case',
  moduleId: 'module-1',
  difficulty: 'intro',
  presentation: 'Presentation',
  reveals: ['Reveal'],
  checkpoints: [
    {
      id: 'cp-1',
      prompt: 'Prompt?',
      type: 'short-text',
      acceptedAnswers: ['avs'],
      correctFeedback: 'Correct',
      incorrectFeedback: 'Incorrect',
      dangerNote: 'Danger',
      tags: ['central-miss-risk']
    }
  ]
};

function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    }
  };
}

describe('customCaseStorage', () => {
  beforeEach(() => {
    const localStorage = createLocalStorageMock();
    // @ts-expect-error test window mock
    global.window = { localStorage };
  });

  it('persists and returns valid custom case', () => {
    saveCustomCase(validCase);
    const allCases = getCustomCases();
    expect(allCases.length).toBe(1);
    expect(allCases[0].id).toBe('saved-case-1');
  });

  it('throws when case is invalid', () => {
    expect(() => saveCustomCase({ ...validCase, id: '' })).toThrow(/Case id is required/);
  });

  it('exports and imports case bundles', () => {
    saveCustomCase(validCase);
    const bundle = exportCustomCaseBundle({ author: 'Tester', sourceDocuments: 'Doc A' });
    const parsedBundle = JSON.parse(bundle);
    expect(parsedBundle.metadata.author).toBe('Tester');
    expect(parsedBundle.metadata.checksum).toBeTruthy();
    expect(parsedBundle.metadata.signature).toBeTruthy();

    // clear and re-import
    // @ts-expect-error test window mock
    global.window.localStorage.clear();
    const imported = importCustomCaseBundle(bundle);

    expect(imported.length).toBe(1);
    expect(imported[0].id).toBe('saved-case-1');
  });

  it('previews conflicts and signature state before import', () => {
    saveCustomCase(validCase);
    const bundle = exportCustomCaseBundle();
    const preview = previewBundleImport(bundle);

    expect(preview.totalIncoming).toBe(1);
    expect(preview.conflictingCases).toEqual(['saved-case-1']);
    expect(preview.checksum).toBeTruthy();
    expect(preview.signatureValid).toBe(true);
  });

  it('records import history entries', () => {
    const bundle = exportCustomCaseBundle();
    importCustomCaseBundle(bundle);
    const history = getImportHistory();

    expect(history.length).toBe(1);
    expect(history[0].checksum).toBeTruthy();
  });
});
