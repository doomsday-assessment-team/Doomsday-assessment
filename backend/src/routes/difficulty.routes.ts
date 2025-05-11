import { Router } from 'express';
import {
  getAllDifficulties,
  createDifficulty,
  deleteDifficulty
} from '../controllers/difficulty.controller';

const router = Router();

router.get('/difficulties', getAllDifficulties);
router.post('/difficulties', createDifficulty);
router.delete('/difficulties:id', deleteDifficulty);

export default router;