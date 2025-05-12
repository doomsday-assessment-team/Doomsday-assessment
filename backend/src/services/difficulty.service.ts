import * as difficultyModel from '../models/difficulty.model';

export const getAllDifficulties = async () => {
  return await difficultyModel.findAllDifficulties();
};
