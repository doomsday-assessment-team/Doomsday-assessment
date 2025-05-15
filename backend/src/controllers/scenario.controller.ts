import { Request, Response, NextFunction } from 'express';
import * as scenarioService from '../services/scenario.service';
import { ApiResponse } from '../types/api-response';

export const getAllScenarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scenarios = await scenarioService.getAllScenarios();
    console.log('📦 Scenarios returned:', scenarios);
    const response: ApiResponse<typeof scenarios> = { data: scenarios };
    res.json(scenarios);
  } catch (error) {
    next(error);
  }
};


