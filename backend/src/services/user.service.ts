import { getAssessmentHistoryDetails } from '../repositories/user.repository';
import { AssessmentHistory } from '../types/global-types';

export const transformAssessmentHistoryDetails = async (
  historyId: number
): Promise<AssessmentHistory> => {
  const rows = await getAssessmentHistoryDetails(historyId);
  const grouped = rows.reduce<Record<string, AssessmentHistory>>((acc, row) => {
    const historyIdStr = row.history_id.toString();
    
    if (!acc[historyIdStr]) {
      acc[historyIdStr] = {
        history_id: row.history_id,
        feedback: row.feedback,
        timestamp: row.timestamp.toISOString(),
        scenario_name: row.scenario_name,
        scenario_id: row.scenario_id,
        difficulty_id: row.difficulty_id,
        difficulty_name: row.difficulty_name,
        questions: []
      };
    }

    let question = acc[historyIdStr].questions.find(q => q.question_id === row.question_id);

    if (!question) {
      question = {
        selected_option_id: row.selected_option_id,
        question_id: row.question_id,
        question_text: row.question_text,
        options: []
      };
      acc[historyIdStr].questions.push(question);
    }

    const optionExists = question.options.some(o => o.option_id === row.option_id);
    
    if (!optionExists) {
      question.options.push({
        option_id: row.option_id,
        option_text: row.option_text,
        points: row.points
      });
    }

    return acc;
  }, {});

  return grouped[historyId.toString()];
};
