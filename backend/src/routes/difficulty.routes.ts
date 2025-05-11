import { Router } from 'express';
import {
  getAllDifficulties,
  createDifficulty,
  deleteDifficulty
} from '../controllers/difficulty.controller';

const router = Router();

router.get('/difficulties', getAllDifficulties);

export default router;