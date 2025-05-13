import db from '../config/db';

export const findAllDifficulties = async () => {
  return await db.any('SELECT question_difficulty_id, question_difficulty_name, time FROM question_difficulty');
};
