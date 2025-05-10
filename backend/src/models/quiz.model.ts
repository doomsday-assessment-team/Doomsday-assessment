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
    options: { option_id: number; option_text: string, points: number }[]; // From json_agg
}

interface OptionPoints {
    option_id: number;
    points: number;
}

interface HistoryRecord {
    history_id: number;
    timestamp: Date;
}

export class QuizModel {
    static async findQuestionsByCriteria({
      scenario_id,
      question_difficulty_id,
      limit = 10,
    }: {
      scenario_id: number;
      question_difficulty_id?: number;
      limit?: number;
    }): Promise<Question[]> {
      // SQL query remains the same
      let baseQuery = `
        SELECT
          q.question_id,
          q.question_text,
          q.question_difficulty_id,
          qd.question_difficulty_name,
          qd.time AS difficulty_time,
          q.scenario_id,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'option_id', o.option_id,
                  'option_text', o.option_text,
                  'points', o.points
                ) ORDER BY o.option_id
              )
              FROM option o
              WHERE o.question_id = q.question_id
            ),
            '[]'::json
          ) AS options
        FROM question q
        JOIN question_difficulty qd ON q.question_difficulty_id = qd.question_difficulty_id
        WHERE q.scenario_id = $1
      `;
      const queryParams: any[] = [scenario_id];
      let paramIndex = 2;
  
      if (question_difficulty_id !== undefined) {
        baseQuery += ` AND q.question_difficulty_id = $${paramIndex++}`;
        queryParams.push(question_difficulty_id);
      }
      baseQuery += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
      queryParams.push(limit);
  
      // Use db.any for queries expected to return multiple rows or none
      const rows = await db.any<QuestionDbRow>(baseQuery, queryParams);
      return rows as Question[];
    }
  
    static async getPointsForOptions(optionIds: number[], t?: ITask<any>): Promise<Map<number, number>> {
      const queryInterface = t || db; // Use transaction task if provided, else use db directly
      const pointsQuery = `SELECT option_id, points FROM option WHERE option_id = ANY($1::int[])`;
      const rows = await queryInterface.any<OptionPoints>(pointsQuery, [optionIds]);
      return new Map(rows.map(row => [row.option_id, row.points]));
    }
  
    static async createHistory(userId: number, t?: ITask<any>): Promise<HistoryRecord> {
      const queryInterface = t || db;
      const historyInsertQuery = `
        INSERT INTO history (user_id, timestamp)
        VALUES ($1, NOW())
        RETURNING history_id, timestamp;
      `;
      // Use db.one or db.oneOrNone if you expect exactly one row or one/zero
      const row = await queryInterface.one<HistoryRecord>(historyInsertQuery, [userId]);
      return row;
    }
  
    static async createHistoryQuestions(
      historyId: number,
      selectedOptions: SelectedOptionInput[],
      t: ITask<any> | IDatabase<any> 
    ): Promise<void> {
      const queryInterface = t || db;
      if (selectedOptions.length === 0) {
        return;
      }
  
      
      // const queries = selectedOptions.map(so => {
      //   return queryInterface.none( // .none expects no data to be returned
      //     'INSERT INTO history_question (history_id, question_id, option_id) VALUES ($1, $2, $3)',
      //     [historyId, so.question_id, so.option_id]
      //   );
      // });
      
     
      await t.tx(async (transactionTask) => {
          const insertQueries = selectedOptions.map(so => {
              return transactionTask.none(
                  'INSERT INTO history_question (history_id, question_id, option_id) VALUES ($1, $2, $3)',
                  [historyId, so.question_id, so.option_id]
              );
          });
          return transactionTask.batch(insertQueries);
      });
      
    }
  }