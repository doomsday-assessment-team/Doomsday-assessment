import express, { Request, Response, NextFunction } from 'express';
import { loginUser } from "../repositories/login.user";
import { validateParamsWithMessage } from "../utils/parameter-validation";
import { ErrorResponse } from '../types/error-response';
import { getGroupedUserQuestionHistory } from '../services/admin.service';

const router = express.Router();

router.get("/me", (req, res) => {
  const user = req.user;
  res.json({ user });
});

router.get("/roles", (req, res) => {
  const roles = req.user?.roles;
  res.json(roles);
});

router.post("/login", async (req, res) => {
  if (req.user) {
    const result = await loginUser(
      req.user?.given_name,
      req.user?.family_name,
      req.user?.google_subject
    );
    res.status(200).send(result);
    return;
  }

  res
    .status(401)
    .json({ error: "Unauthorized: Could not log in successfully." });
});

router.get('/user-question-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'scenarios', type: 'string', required: false },
      { name: 'difficulties', type: 'string', required: false },
      { name: 'start_date', type: 'string', required: false },
      { name: 'end_date', type: 'string', required: false },
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      if (req.query.scenarios && !(/^(\d+,)*\d+$/.test(req.query.scenarios as string))) {
        res.status(400).json({
          error: 'ValidationError',
          message: "scenarios must be a comma-separated list of numbers"
        });
      } else {
        const userId = req.user?.user_id;
        if (userId){
          const scenarios = req.query.scenarios as string | undefined;
          const difficulties = req.query.difficulties as string | undefined;
          const startDate = req.query.start_date as string | undefined;
          const endDate = req.query.end_date as string | undefined;
          const result = await getGroupedUserQuestionHistory(undefined, userId, scenarios, difficulties, startDate, endDate);
          res.json(result);
        } else {
          res.status(400).json({
            error: 'ValidationError',
            message: "User does not exist in database"
          });
        }
        
      }
    }
  
  } catch (error) {
    next(error);
  }
});

export default router;
