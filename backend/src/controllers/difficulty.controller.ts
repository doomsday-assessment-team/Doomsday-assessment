import { Request, Response, NextFunction } from 'express';
import * as difficultyService from '../services/difficulty.service';
import { ApiResponse } from '../types/api-response';

export const getAllDifficulties = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulties = await difficultyService.getAllDifficulties();
    const response: ApiResponse<typeof difficulties> = { data: difficulties };
    res.json(difficulties);
  } catch (error) {
    next(error);
  }
};
