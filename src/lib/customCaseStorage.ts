import type { TrainingCase } from '@/types/case';
import { validateTrainingCase } from '@/lib/caseValidation';

const CUSTOM_CASES_KEY = 'vestibular_custom_cases_v1';
const IMPORT_HISTORY_KEY = 'vestibular_import_history_v1';

export type BundleMetadata = {
  author?: string;
  sourceDocuments?: string;
  moduleMapping?: string;
  checksum?: string;
  signature?: string;
};

export type CaseBundle = {
  exportedAt: string;
  version: 1;
  metadata?: BundleMetadata;
  cases: TrainingCase[];
};

export type BundlePreview = {
  checksum: string;
  signatureValid: boolean;
  totalIncoming: number;
  newCases: string[];
  conflictingCases: string[];
  metadata?: BundleMetadata;
};

export type ImportHistoryEntry = {
  importedAt: string;
  checksum: string;
  signatureValid: boolean;
  importedCount: number;
  newCases: string[];
  conflictingCases: string[];
};

function hasWindow() {
  return typeof window !== 'undefined';
}

function checksum(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function signatureFor(checksumValue: string) {
  // local-only integrity marker (non-cryptographic)
  return checksum(`vestibular-bundle-signature:${checksumValue}`);
}

function parseBundle(bundleText: string): CaseBundle {
  const parsed = JSON.parse(bundleText) as Partial<CaseBundle> | TrainingCase[];
  const cases = Array.isArray(parsed) ? parsed : parsed.cases;
  if (!Array.isArray(cases)) {
    throw new Error('Bundle format invalid: expected { cases: TrainingCase[] } or TrainingCase[].');
  }

  return {
    exportedAt: Array.isArray(parsed) ? new Date().toISOString() : parsed.exportedAt ?? new Date().toISOString(),
    version: 1,
    metadata: Array.isArray(parsed) ? undefined : parsed.metadata,
    cases
  };
}

function validateCases(cases: TrainingCase[]) {
  return cases.map((candidate) => {
    const validation = validateTrainingCase(candidate as TrainingCase);
    if (!validation.valid) {
      throw new Error(`Invalid case in bundle: ${validation.errors.join(' ')}`);
    }
    return candidate as TrainingCase;
  });
}

function readImportHistory(): ImportHistoryEntry[] {
  if (!hasWindow()) return [];
  const raw = window.localStorage.getItem(IMPORT_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ImportHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendImportHistory(entry: ImportHistoryEntry) {
  if (!hasWindow()) return;
  const existing = readImportHistory();
  const next = [entry, ...existing].slice(0, 25);
  window.localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(next));
}

export function getImportHistory(): ImportHistoryEntry[] {
  return readImportHistory();
}

export function getCustomCases(): TrainingCase[] {
  if (!hasWindow()) return [];

  const raw = window.localStorage.getItem(CUSTOM_CASES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TrainingCase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCase(newCase: TrainingCase): TrainingCase[] {
  const validation = validateTrainingCase(newCase);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const existing = getCustomCases().filter((item) => item.id !== newCase.id);
  const next = [...existing, newCase];
  if (hasWindow()) {
    window.localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(next));
  }
  return next;
}

export function getCaseByIdIncludingCustom(caseId: string, seedCases: TrainingCase[]): TrainingCase | undefined {
  const custom = getCustomCases();
  return [...seedCases, ...custom].find((item) => item.id === caseId);
}

export function exportCustomCaseBundle(metadata?: BundleMetadata): string {
  const cases = getCustomCases();
  const caseChecksum = checksum(JSON.stringify(cases));
  const bundle: CaseBundle = {
    exportedAt: new Date().toISOString(),
    version: 1,
    metadata: {
      ...metadata,
      checksum: caseChecksum,
      signature: signatureFor(caseChecksum)
    },
    cases
  };
  return JSON.stringify(bundle, null, 2);
}

export function previewBundleImport(bundleText: string): BundlePreview {
  const parsed = parseBundle(bundleText);
  const validCases = validateCases(parsed.cases);
  const existingIds = new Set(getCustomCases().map((item) => item.id));

  const newCases = validCases.filter((item) => !existingIds.has(item.id)).map((item) => item.id);
  const conflictingCases = validCases.filter((item) => existingIds.has(item.id)).map((item) => item.id);
  const computedChecksum = checksum(JSON.stringify(validCases));
  const signatureValid =
    parsed.metadata?.checksum === computedChecksum &&
    parsed.metadata?.signature === signatureFor(computedChecksum);

  return {
    checksum: computedChecksum,
    signatureValid,
    totalIncoming: validCases.length,
    newCases,
    conflictingCases,
    metadata: parsed.metadata
  };
}

export function importCustomCaseBundle(bundleText: string): TrainingCase[] {
  const preview = previewBundleImport(bundleText);
  const parsed = parseBundle(bundleText);
  const validCases = validateCases(parsed.cases);

  const merged = [...getCustomCases()];
  validCases.forEach((incoming) => {
    const index = merged.findIndex((existing) => existing.id === incoming.id);
    if (index >= 0) merged[index] = incoming;
    else merged.push(incoming);
  });

  if (hasWindow()) {
    window.localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(merged));
  }

  appendImportHistory({
    importedAt: new Date().toISOString(),
    checksum: preview.checksum,
    signatureValid: preview.signatureValid,
    importedCount: validCases.length,
    newCases: preview.newCases,
    conflictingCases: preview.conflictingCases
  });

  return merged;
}
