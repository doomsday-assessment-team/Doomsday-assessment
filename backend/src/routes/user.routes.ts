import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticateJWT, (req, res) => {
    const user = (req as any).user;
    res.json({ user });
  });
  
router.get('/', getAllUsers);

export default router;