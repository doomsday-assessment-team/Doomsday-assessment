import { ITask, IDatabase } from "pg-promise";
import db from "../config/db";
import { Question, SelectedOptionInput } from "../types/quiz";

interface QuestionDbRow {
    question_id: number;
    question_text: string;
    question_difficulty_id: number;
    question_difficulty_name: string;
    difficulty_time: number;
    scenario_id: number;
    scenario_name: string;
    options: { option_id: number; option_text: string, points: number }[];
}

interface OptionPoints {
    option_id: number;
    points: number;
}

interface HistoryRecord {
    history_id: number;
    timestamp: Date;
    feedback: string;
}

export const findAllScenarios = async () => {
  return await db.any(
    `SELECT scenario_id, scenario_name FROM scenarios ORDER BY scenario_id ASC`
  );
};

export const findAllDifficulties = async () => {
  return await db.any('SELECT question_difficulty_id, question_difficulty_name, time FROM question_difficulties');
};

export const findQuestionsByCriteria = async ({
    scenario_id,
    question_difficulty_id,
    limit = 10,
}: {
    scenario_id: number;
    question_difficulty_id?: number;
    limit?: number;
}): Promise<Question[]> => {
    let baseQuery = `
    SELECT
      q.question_id,
      q.question_text,
      q.question_difficulty_id,
      qd.question_difficulty_name,
      qd.time AS difficulty_time,
      q.scenario_id,
      s.scenario_name,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'option_id', o.option_id,
              'option_text', o.option_text,
              'points', o.points
            ) ORDER BY o.option_id
          )
          FROM options o
          WHERE o.question_id = q.question_id
        ),
        '[]'::json
      ) AS options
    FROM questions q
    JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    JOIN scenarios s ON q.scenario_id = s.scenario_id
    WHERE q.scenario_id = $1
  `;
    const queryParams: any[] = [scenario_id];
    let paramIndex = 2;

    if (question_difficulty_id !== undefined) {
        baseQuery += ` AND q.question_difficulty_id = $${paramIndex++}`;
        queryParams.push(question_difficulty_id);
    }

    baseQuery += ` LIMIT $${paramIndex}`;
    queryParams.push(limit);

    const rows = await db.any<QuestionDbRow>(baseQuery, queryParams);
    return rows as Question[];
}

export const getPointsForOptions = async (optionIds: number[], t?: ITask<any>) => {
    const queryInterface = t || db; // Use transaction task if provided, else use db directly
    const pointsQuery = `SELECT option_id, points FROM options WHERE option_id = ANY($1::int[])`;
    const rows = await queryInterface.any<OptionPoints>(pointsQuery, [optionIds]);
    return new Map(rows.map(row => [row.option_id, row.points]));
}

export const getOptionsbyId = async (question_id: number) => {
    const result = await db.any('SELECT * FROM options WHERE question_id = $1', [question_id]);
    return result;
}

export const getScenarioDetailsFromDB = async (scenario_id: number) => {
    const result = await db.oneOrNone('SELECT scenario_id, scenario_name FROM scenarios WHERE scenario_id = $1', [scenario_id]);
    return result;
}

export const getQuestion = async (question_id: number) => {
    const result = await db.oneOrNone('SELECT * FROM questions WHERE question_id = $1', [question_id]);
    return result;
}

export const updateQuestions = async (question_id: number, question_text: string) => {
    const result = await db.one('UPDATE questions SET question_text = $1 WHERE question_id = $2 RETURNING *', [question_text, question_id]);
    return result;
}

export const createHistory = async (userId: number, feedback: string,  t?: ITask<any>): Promise<HistoryRecord> => {
    const queryInterface = t || db;
    const historyInsertQuery = `
    INSERT INTO history (user_id, feedback, timestamp)
    VALUES ($1, $2, NOW())
    RETURNING history_id, feedback, timestamp;
  `;
    const row = await queryInterface.one<HistoryRecord>(historyInsertQuery, [userId, feedback]);
    return row;
}

export const createHistoryQuestions = async (
    historyId: number,
    selectedOptions: SelectedOptionInput[],
    t: ITask<any> | IDatabase<any>
): Promise<void> => {
    const queryInterface = t || db;
    if (selectedOptions.length === 0) {
        return;
    }

    await t.tx(async (transactionTask) => {
        const insertQueries = selectedOptions.map(so => {
            return transactionTask.none(
                'INSERT INTO history_questions (history_id, question_id, option_id) VALUES ($1, $2, $3)',
                [historyId, so.question_id, so.option_id]
            );
        });
        return transactionTask.batch(insertQueries);
    });

}
