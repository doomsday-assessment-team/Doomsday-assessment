import { Router } from 'express';
import {
  getAllScenarios,
  createScenario,
  deleteScenario
} from '../controllers/scenario.controller';

const router = Router();

router.get('/scenarios', getAllScenarios);
router.post('/scenarios', createScenario);
router.delete('/scenarios:id', deleteScenario);

export default router;