const DANGEROUS_TAGS = new Set(['central-miss-risk', 'escalation-language']);

export function nextCaseQueue(caseIds: string[], missedDangerously: boolean) {
  if (!missedDangerously) return caseIds;
  return [...caseIds].reverse();
}

export function updateReviewQueue(
  currentQueue: string[],
  caseId: string,
  isCorrect: boolean,
  tags: string[]
): string[] {
  const withoutCase = currentQueue.filter((item) => item !== caseId);
  const dangerousMiss = !isCorrect && tags.some((tag) => DANGEROUS_TAGS.has(tag));

  if (dangerousMiss) {
    return [caseId, ...withoutCase.slice(0, 9)];
  }

  if (!isCorrect) {
    return [...withoutCase.slice(0, 9), caseId];
  }

  return withoutCase;
}
