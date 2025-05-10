import { Router } from 'express';
import { loginUser } from '../services/loginUser';

const router = Router();

router.get('/me', (req, res) => {
  console.log((req as any).user); //TODO: REMOVE
    const user = (req as any).user;
    res.json({ user });
  });

router.post('/loginUser', async (req, res) => {
  if(req.user) {
    const result = await loginUser (
      req.user?.given_name, 
      req.user?.family_name,
      req.user?.email,
      req.user?.id
    );
    res.status(200).send(result);
    return;
    }

  res.status(401).json({ error: "Unauthorized: Could not log in successfully." });
  });

export default router;