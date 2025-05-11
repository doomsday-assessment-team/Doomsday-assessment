import * as difficultyModel from '../models/difficulty.model';

export const getAllDifficulties = async () => {
  return await difficultyModel.findAllDifficulties();
};

export const createDifficulty = async (name: string, time: number) => {
  return await difficultyModel.insertDifficulty(name, time);
};

export const deleteDifficulty = async (id: number) => {
  const result = await difficultyModel.removeDifficultyById(id);
  return result.rowCount;
};