import { Request, Response, NextFunction } from 'express';
import * as difficultyService from '../services/difficulty.service';

export const getAllDifficulties = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulties = await difficultyService.getAllDifficulties();
    res.json(difficulties);
  } catch (error) {
    next(error);
  }
};
