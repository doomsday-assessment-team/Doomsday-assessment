import db from "../config/db";
import { AssessmentSummaryRow, RawUserQuestionRow } from "../types/global-types";

interface User {
  user_id: number;
  name: string;
  surname: string;
  google_subject: string;
}

export const getUserByGoogleSubject = async (
  googleSubject: string
): Promise<User | null> => {
  const user = await db.oneOrNone<User>(
    'SELECT * FROM users WHERE google_subject = $1',
    [googleSubject]
  );
  return user;
};

export const getUserAssessmentSummaries = async (
  userId?: number,
  scenario?: number,
  difficulty?: number,
  startDate?: string,
  endDate?: string,
  orderBy?: boolean
): Promise<AssessmentSummaryRow[]> => {
  const whereConditions = [];
  const queryParams: any[] = [];
  let paramCounter = 1;

  if (userId !== undefined) {
    whereConditions.push(`u.user_id = $${paramCounter++}`);
    queryParams.push(userId);
  }

  if (scenario !== undefined) {
    whereConditions.push(`q.scenario_id = $${paramCounter++}`);
    queryParams.push(scenario);
  }

  if (difficulty !== undefined) {
    whereConditions.push(`q.question_difficulty_id = $${paramCounter++}`);
    queryParams.push(difficulty);
  }

  if (startDate && endDate) {
    whereConditions.push(`h.timestamp BETWEEN $${paramCounter} AND $${paramCounter + 1}`);
    queryParams.push(startDate, endDate);
    paramCounter += 2;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const orderClause = orderBy
    ? `ORDER BY h.timestamp DESC`
    : `ORDER BY h.history_id`;

  const query = `
    SELECT 
      h.history_id,
      h.timestamp,
      q.scenario_id,
      s.scenario_name,
      qd.question_difficulty_id,
      qd.question_difficulty_name,
      SUM(so.points) AS total_points
    FROM history h
    INNER JOIN users u ON h.user_id = u.user_id
    INNER JOIN history_questions hq ON h.history_id = hq.history_id
    INNER JOIN questions q ON hq.question_id = q.question_id
    INNER JOIN options so ON hq.option_id = so.option_id
    INNER JOIN scenarios s ON q.scenario_id = s.scenario_id
    INNER JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    ${whereClause}
    GROUP BY 
      h.history_id,
      h.timestamp,
      u.user_id,
      q.scenario_id,
      s.scenario_name,
      qd.question_difficulty_id,
      qd.question_difficulty_name
    ${orderClause}
  `;

  return db.manyOrNone<AssessmentSummaryRow>(query, queryParams);
};


export const getAssessmentHistoryDetails = async (
  historyId: number
): Promise<RawUserQuestionRow[]> => {
  const query = `
    SELECT
      s.scenario_name,
      s.scenario_id,
      qd.question_difficulty_id AS difficulty_id,
      qd.question_difficulty_name AS difficulty_name,
      q.question_id,
      q.question_text,
      so.option_id AS selected_option_id,
      o.option_id,
      o.option_text,
      o.points,
      h.timestamp,
      h.history_id,
      h.feedback
    FROM history_questions hq
    INNER JOIN history h ON hq.history_id = h.history_id
    INNER JOIN questions q ON hq.question_id = q.question_id
    INNER JOIN options so ON hq.option_id = so.option_id
    LEFT JOIN options o ON q.question_id = o.question_id
    INNER JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    INNER JOIN scenarios s ON q.scenario_id = s.scenario_id
    WHERE h.history_id = $1
  `;

  return db.manyOrNone<RawUserQuestionRow>(query, [historyId]);
};


