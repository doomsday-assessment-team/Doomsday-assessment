import * as difficultyRepository from '../repositories/difficulty.repository';
import { QuestionDifficulty } from '../types/global-types';

export const getAllDifficulties = async (): Promise<QuestionDifficulty[]> => {
  return await difficultyRepository.findAll();
};

export const createDifficulty = async (data: {
  question_difficulty_name: string;
  time: number;
}): Promise<QuestionDifficulty> => {
  if (!data.question_difficulty_name || data.question_difficulty_name.trim() === '') {
    throw new Error('Difficulty name cannot be empty.');
  }
  if (data.time === undefined || typeof data.time !== 'number' || data.time <= 0) {
    throw new Error('Time limit must be a positive number.');
  }
  return await difficultyRepository.create(data.question_difficulty_name.trim(), data.time);
};

export const updateDifficulty = async (
  difficultyId: number,
  data: { question_difficulty_name?: string; time?: number }
): Promise<QuestionDifficulty | null> => {
  if (data.question_difficulty_name !== undefined && data.question_difficulty_name.trim() === '') {
    throw new Error('Difficulty name cannot be empty if provided.');
  }
  if (data.time !== undefined && (typeof data.time !== 'number' || data.time <= 0)) {
    throw new Error('Time limit must be a positive number if provided.');
  }

  if (data.question_difficulty_name === undefined && data.time === undefined) {
      // No fields to update, return existing or throw error based on desired behavior
      const existing = await difficultyRepository.findById(difficultyId);
      if (!existing) throw new Error('Difficulty level not found.');
      return existing;
  }

  const updated = await difficultyRepository.update(
    difficultyId,
    data.question_difficulty_name?.trim(),
    data.time
  );
  if (!updated) {
     throw new Error('Difficulty level not found or update failed.');
  }
  return updated;
};

export const deleteDifficulty = async (difficultyId: number): Promise<boolean> => {
  const deletedCount = await difficultyRepository.remove(difficultyId);
  if (deletedCount === 0) {
    throw new Error('Difficulty level not found or delete failed (possibly in use).');
  }
  return true;
};
