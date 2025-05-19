import express, { Request, Response, NextFunction, Router } from 'express';
import * as scenarioService from "../services/scenario.service"; // Adjust path as needed

const router = express.Router();

// GET /scenarios
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('[Route] GET /scenarios: Entered');
  try {
    const scenarios = await scenarioService.getAllScenarios();
    console.log('[Route] GET /scenarios: Service returned, sending response.');
    res.json(scenarios); // Send the scenarios back to the client
  } catch (error) {
    console.error('[Route] GET /scenarios: Error caught', error);
    next(error); // Pass error to the global error handler
  }
});


router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('[Route] POST /scenarios: Entered, body:', req.body);
  try {
    const { name } = req.body; 
    if (!name) {
      console.log('[Route] POST /scenarios: Validation failed - Name is required.');
      res.status(400).json({ message: 'Scenario name is required in the request body.' });
      return;
    }
    const newScenario = await scenarioService.createScenario(name);
    console.log('[Route] POST /scenarios: Service returned, sending response.');
    res.status(201).json(newScenario);
    return;
  } catch (error) {
    console.error('[Route] POST /scenarios: Error caught', error);
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


router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(`[Route] PUT /scenarios/${req.params.id}: Entered, body:`, req.body);
    try {
      const id = Number(req.params.id);
      const { name } = req.body; 

      if (isNaN(id)) {
        console.log(`[Route] PUT /scenarios/${req.params.id}: Validation failed - Invalid ID.`);
        res.status(400).json({ message: 'Invalid scenario ID format.' });
        return;
      }
      if (!name) {
        console.log(`[Route] PUT /scenarios/${id}: Validation failed - Name is required.`);
        res.status(400).json({ message: 'Scenario name is required in the request body for update.' });
        return;
      }

      const updatedScenario = await scenarioService.updateScenario(id, name);
      if (!updatedScenario) {
        console.log(`[Route] PUT /scenarios/${id}: Service indicated scenario not found.`);
        res.status(404).json({ message: `Scenario with ID ${id} not found.` });
        return;
      }
      console.log(`[Route] PUT /scenarios/${id}: Service returned, sending response.`);
      res.json(updatedScenario);
    } catch (error) {
      console.error(`[Route] PUT /scenarios/${req.params.id}: Error caught`, error);
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
          res.status(409).json({ message: 'Updating to this name would conflict with an existing scenario name.' });
          return;
      }
      if (error instanceof Error && error.message.includes('cannot be empty')) { 
          res.status(400).json({ message: error.message });
          return;
      }
      next(error);
    }
  }
);

// DELETE /scenarios/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`[Route] DELETE /scenarios/${req.params.id}: Entered`);
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      console.log(`[Route] DELETE /scenarios/${req.params.id}: Validation failed - Invalid ID.`);
      res.status(400).json({ message: 'Invalid scenario ID format.' });
      return;
    }
    const success = await scenarioService.deleteScenario(id);
    if (!success) {
      console.log(`[Route] DELETE /scenarios/${id}: Service indicated scenario not found or delete failed.`);
      res.status(404).json({ message: `Scenario with ID ${id} not found or could not be deleted (possibly in use).` });
      return;
    }
    console.log(`[Route] DELETE /scenarios/${id}: Service returned success, sending 204 response.`);
    res.status(204).send();
  } catch (error) {
    console.error(`[Route] DELETE /scenarios/${req.params.id}: Error caught`, error);
    next(error);
  }
});

export default router;
