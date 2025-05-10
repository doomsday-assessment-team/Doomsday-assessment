import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticateJWT, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});
  

export default router;