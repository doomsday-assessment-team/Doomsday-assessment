import { getUserQuestionHistoryFromDb } from '../repositories/admin.repository';
import {GroupedQuestionData} from '../types/global-types';

export const getGroupedUserQuestionHistory = async (
  userId: number
): Promise<GroupedQuestionData[]> => {
  const rows = await getUserQuestionHistoryFromDb(userId);

  const grouped = rows.reduce<Record<string, GroupedQuestionData>>((acc, row) => {
    const { scenario_name, history_id } = row;

    if (!acc[scenario_name]) {
      acc[scenario_name] = {
        scenario_name,
        history: []
      };
    }

    let historyEntry = acc[scenario_name].history.find(h => h.history_id === history_id);

    if (!historyEntry) {
      historyEntry = {
        history_id: row.history_id,
        timestamp: row.timestamp,
        questions: []
      };
      acc[scenario_name].history.push(historyEntry);
    }

    let question = historyEntry.questions.find(q => q.question_id === row.question_id);

    if (!question) {
      question = {
        question_id: row.question_id,
        scenario_id: row.scenario_id,
        question_difficulty_id: row.question_difficulty_id,
        question_text: row.question_text,
        options: []
      };
      historyEntry.questions.push(question);
    }

    question.options.push({
      option_id: row.option_id,
      option_text: row.option_text,
      points: row.points
    });

    return acc;
  }, {});

  return Object.values(grouped);
};
