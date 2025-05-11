import db from '../config/db';

export const findAllDifficulties = async () => {
  return await db.any('SELECT question_difficulty_id, question_difficulty_name, time FROM question_difficulty');
};

export const insertDifficulty = async (name: string, time: number) => {
  return await db.one(
    `INSERT INTO question_difficulty (question_difficulty_name, time)
     VALUES ($1, $2)
     RETURNING *`,
    [name, time]
  );
};

export const removeDifficultyById = async (id: number) => {
  return await db.result(
    'DELETE FROM question_difficulty WHERE question_difficulty_id = $1',
    [id]
  );
};