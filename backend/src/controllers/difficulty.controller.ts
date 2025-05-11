import { Request, Response, NextFunction } from 'express';
import * as difficultyService from '../services/difficulty.service';
import { ApiResponse } from '../types/api-response';

export const getAllDifficulties = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulties = await difficultyService.getAllDifficulties();
    const response: ApiResponse<typeof difficulties> = { data: difficulties };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createDifficulty = async (req: Request, res: Response, next: NextFunction) => {
  const { question_difficulty_name, time } = req.body;

  if (!question_difficulty_name || !time) {
    return res.status(400).json({ error: 'Missing name or time value' });
  }

  try {
    const newDiff = await difficultyService.createDifficulty(question_difficulty_name, time);
    res.status(201).json({ data: newDiff });
  } catch (error) {
    next(error);
  }
};

export const deleteDifficulty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await difficultyService.deleteDifficulty(Number(req.params.id));
    res.json({ message: `Deleted difficulty with ID ${req.params.id}`, rowsAffected: deleted });
  } catch (error) {
    next(error);
  }
};
