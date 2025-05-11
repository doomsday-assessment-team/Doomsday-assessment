import { Request, Response, NextFunction } from 'express';
import * as scenarioService from '../services/scenario.service';
import { ApiResponse } from '../types/api-response';

export const getAllScenarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scenarios = await scenarioService.getAllScenarios();
    console.log('📦 Scenarios returned:', scenarios);
    const response: ApiResponse<typeof scenarios> = { data: scenarios };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createScenario = async (req: Request, res: Response, next: NextFunction) => {
  const { scenario_name } = req.body;

  if (!scenario_name) {
    return res.status(400).json({ error: 'Missing scenario_name' });
  }

  try {
    const newScenario = await scenarioService.createScenario(scenario_name);
    res.status(201).json({ data: newScenario });
  } catch (error) {
    next(error);
  }
};

export const deleteScenario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await scenarioService.deleteScenario(Number(req.params.id));
    res.json({ message: `Deleted scenario with ID ${req.params.id}`, rowsAffected: deleted });
  } catch (error) {
    next(error);
  }
};

