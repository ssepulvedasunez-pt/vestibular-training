import { cases } from '@/data/cases';

export function getCaseById(caseId: string) {
  return cases.find((item) => item.id === caseId);
}

export function getSeedCases() {
  return cases;
}
