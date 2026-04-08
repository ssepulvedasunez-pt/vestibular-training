export function isAnswerCorrect(answer: string, acceptedAnswers: string[]) {
  return acceptedAnswers.some((accepted) => accepted.toLowerCase() === answer.trim().toLowerCase());
}
