import { Router } from 'express';
import {
  getAllScenarios,
  createScenario,
  deleteScenario
} from '../controllers/scenario.controller';

const router = Router();

router.get('/scenarios', getAllScenarios);

export default router;