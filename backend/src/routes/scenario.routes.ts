import express, { Request, Response, NextFunction, Router } from 'express';
import * as scenarioService from "../services/scenario.service";

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scenarios = await scenarioService.getAllScenarios();
    res.json(scenarios);
  } catch (error) {
    next(error); 
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scenario_name } = req.body;
    if (!scenario_name || typeof scenario_name !== 'string' || scenario_name.trim() === '') {
      res.status(400).json({ message: 'scenario_name (string) is required in the request body.' });
      return;
    }
    const newScenario = await scenarioService.createScenario(scenario_name);
    res.status(201).json(newScenario);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      res.status(409).json({ message: 'A scenario with this name already exists.' });
      return;
    }
    if (error instanceof Error && error.message.includes('Scenario name cannot be empty')) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { scenario_name } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid scenario ID format.' });
      return;
    }
    if (!scenario_name || typeof scenario_name !== 'string' || scenario_name.trim() === '') { 
      res.status(400).json({ message: 'scenario_name (string) is required in the request body for update.' });
      return;
    }

    const updatedScenario = await scenarioService.updateScenario(id, scenario_name);
    if (!updatedScenario) {
      res.status(404).json({ message: `Scenario with ID ${id} not found.` });
      return;
    }
    res.json(updatedScenario);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      res.status(409).json({ message: 'Updating to this name would conflict with an existing scenario name.' });
      return;
    }
    if (error instanceof Error && error.message.includes('cannot be empty')) { 
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
    }
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid scenario ID format.' });
      return;
    }
    const success = await scenarioService.deleteScenario(id);
    if (!success) {
      res.status(404).json({ message: `Scenario with ID ${id} not found or could not be deleted (possibly in use).` });
      return;
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
    }
    next(error);
  }
});

export default router;
