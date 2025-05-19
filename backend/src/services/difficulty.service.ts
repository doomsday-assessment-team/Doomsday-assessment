import { findAllDifficulties } from "../repositories/quiz.repository";

export const getAllDifficulties = async () => {
  return await findAllDifficulties();
};
