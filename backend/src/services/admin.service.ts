import { getUserQuestionHistory } from '../repositories/admin.repository';
import { AssessmentHistory } from '../types/global-types';

export const getGroupedUserQuestionHistory = async (
  userName?: string,
  userId?: number,
  scenarios?: string,
  difficulties?: string,
  startDate?: string,
  endDate?: string,
): Promise<AssessmentHistory[]> => {
  const rows = await getUserQuestionHistory(userName, userId, scenarios, difficulties, startDate, endDate);
  const grouped = rows.reduce<Record<string, AssessmentHistory>>((acc, row) => {
    const historyId = row.history_id.toString();
    
    if (!acc[historyId]) {
      acc[historyId] = {
        history_id: row.history_id,
        feedback: row.feedback,
        timestamp: row.timestamp,
        scenario_name: row.scenario_name,
        scenario_id: row.scenario_id,
        difficulty_id: row.difficulty_id,
        difficulty_name: row.difficulty_name,
        user_name: `${row.name} ${row.surname}`,
        user_id: row.user_id,
        questions: []
      };
    }

    let question = acc[historyId].questions.find(q => q.question_id === row.question_id);

    if (!question) {
      question = {
        selected_option_id: row.selected_option_id,
        question_id: row.question_id,
        question_text: row.question_text,
        options: []
      };
      acc[historyId].questions.push(question);
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

  return Object.values(grouped);
};