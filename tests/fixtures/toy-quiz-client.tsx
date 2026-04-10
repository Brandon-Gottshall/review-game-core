export function renderQuestion(currentQuestion: { type: string }) {
  if (currentQuestion.type === 'trace_variables') {
    return 'trace';
  }

  if (currentQuestion.type === 'predict_output') {
    return 'output';
  }

  return 'default';
}
