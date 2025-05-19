import db from '../config/db';
import { QuestionDifficulty } from '../types/global-types';

export const findAll = async (): Promise<QuestionDifficulty[]> => {
  return db.any<QuestionDifficulty>(
    `SELECT question_difficulty_id, question_difficulty_name, time FROM question_difficulties ORDER BY question_difficulty_id ASC`
  );
};

export const findById = async (difficultyId: number): Promise<QuestionDifficulty | null> => {
  return db.oneOrNone<QuestionDifficulty>(
    `SELECT question_difficulty_id, question_difficulty_name, time FROM question_difficulties WHERE question_difficulty_id = $1`,
    [difficultyId]
  );
};

export const create = async (difficultyName: string, timeLimit: number): Promise<QuestionDifficulty> => {
  return db.one<QuestionDifficulty>(
    `INSERT INTO question_difficulties(question_difficulty_name, time) VALUES($1, $2) RETURNING *`,
    [difficultyName, timeLimit]
  );
};

export const update = async (
  difficultyId: number,
  difficultyName?: string,
  timeLimit?: number
): Promise<QuestionDifficulty | null> => {
  const updateParts: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (difficultyName !== undefined) {
    updateParts.push(`question_difficulty_name = $${paramIndex++}`);
    queryParams.push(difficultyName);
  }
  if (timeLimit !== undefined) {
    updateParts.push(`time = $${paramIndex++}`);
    queryParams.push(timeLimit);
  }

  if (updateParts.length === 0) {
    return findById(difficultyId); 
  }

  queryParams.push(difficultyId);
  const query = `
    UPDATE question_difficulties 
    SET ${updateParts.join(', ')} 
    WHERE question_difficulty_id = $${paramIndex} 
    RETURNING *`;
  return db.oneOrNone<QuestionDifficulty>(query, queryParams);
};

export const remove = async (difficultyId: number): Promise<number> => {
  const result = await db.result(
    'DELETE FROM question_difficulties WHERE question_difficulty_id = $1',
    [difficultyId]
  );
  return result.rowCount;
};
