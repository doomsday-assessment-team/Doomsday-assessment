import { Router } from 'express';
import {
  getAllScenarios
} from '../controllers/scenario.controller';

const router = Router();

router.get('/scenarios', getAllScenarios);

export default router;