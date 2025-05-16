import express, { Request, Response, NextFunction } from 'express';
import * as db from '../repositories/admin.repository';
import { validateParamsWithMessage } from '../utils/parameter-validation';
import { ErrorResponse } from '../types/error-response';
import { getGroupedUserQuestionHistory } from '../services/admin.service';
import { checkAssessmentManagerRole } from '../middlewares/auth.middleware';

const router = express.Router();

// router.use(checkAssessmentManagerRole);

router.post('/scenarios', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'scenario_name', type: 'string', required: true }
    ]);

    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      const scenario = await db.addScenario(req.query.scenario_name as string);
      res.status(201).json(scenario);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/scenarios/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const idValidationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (idValidationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: idValidationError
      };
      res.status(400).json(errorResponse);
    } else {
      const validationError = validateParamsWithMessage(req.query, [
        { name: 'scenario_name', type: 'string', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.scenario_name === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'Please provide scenario_name.'
          };
          res.status(400).json(errorResponse);
        } else {
          const scenario = await db.updateScenario(Number(id), req.query.scenario_name as string);
          res.json(scenario);
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/scenarios/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const validationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.deleteScenario(Number(id));
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

router.post('/questions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'scenario_id', type: 'number', required: true },
      { name: 'question_difficulty_id', type: 'number', required: true },
      { name: 'question_text', type: 'string', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      const question = await db.addQuestion(
        Number(req.query.scenario_id),
        Number(req.query.question_difficulty_id),
        req.query.question_text as string
      );
      res.status(201).json(question);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/questions/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const idValidationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (idValidationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: idValidationError
      };
      res.status(400).json(errorResponse);
    } else {
      const validationError = validateParamsWithMessage(req.query, [
        { name: 'question_difficulty_id', type: 'number', required: false },
        { name: 'question_text', type: 'string', required: false },
        { name: 'scenario_id', type: 'number', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.question_difficulty_id === undefined && req.query.question_text === undefined && req.query.scenario_id === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'No fields to update. Please provide at least one of scenario_id, question_difficulty_id or question_text.'
          };
          res.status(400).json(errorResponse);
        } else {
          const question = await db.updateQuestion(
            Number(id),
            req.query.question_difficulty_id ? Number(req.query.question_difficulty_id) : undefined,
            req.query.scenario_id? Number(req.query.scenario_id) : undefined,
            req.query.question_text as string | undefined
          );
          res.json(question);
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/questions/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const validationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.deleteQuestion(Number(id));
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

router.post('/options', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'question_id', type: 'number', required: true },
      { name: 'option_text', type: 'string', required: true },
      { name: 'points', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      const option = await db.addOption(
        Number(req.query.question_id),
        req.query.option_text as string,
        Number(req.query.points)
      );
      res.status(201).json(option);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/options/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const idValidationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (idValidationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: idValidationError
      };
      res.status(400).json(errorResponse);
    } else {
      const validationError = validateParamsWithMessage(req.query, [
        { name: 'option_text', type: 'string', required: false },
        { name: 'points', type: 'number', required: false },
        { name: 'question_id', type: 'number', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.option_text === undefined && req.query.points === undefined && req.query.question_id === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'No fields to update. Please provide at least one of question_id, option_text or points.'
          };
          res.status(400).json(errorResponse);
        } else {
          const option = await db.updateOption(
            Number(id),
            req.query.option_text as string | undefined,
            req.query.points !== undefined ? Number(req.query.points) : undefined,
            req.query.question_id !== undefined ? Number(req.query.question_id): undefined,
          );
          res.json(option);
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/options/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const validationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.deleteOption(Number(id));
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

router.post('/difficulty-levels', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'question_difficulty_name', type: 'string', required: true },
      { name: 'time', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      const difficulty = await db.addDifficultyLevel(
        req.query.question_difficulty_name as string,
        Number(req.query.time)
      );
      res.status(201).json(difficulty);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/difficulty-levels/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const idValidationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (idValidationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: idValidationError
      };
      res.status(400).json(errorResponse);
    } else {
      const validationError = validateParamsWithMessage(req.query, [
        { name: 'question_difficulty_name', type: 'string', required: false },
        { name: 'time', type: 'number', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.question_difficulty_name === undefined && req.query.time === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'No fields to update. Please provide at least one of question_difficulty_name or time.'
          };
          res.status(400).json(errorResponse);
        } else {
          const difficulty = await db.updateDifficultyLevel(
            Number(id),
            req.query.question_difficulty_name as string | undefined,
            req.query.time !== undefined ? Number(req.query.time) : undefined
          );
          res.json(difficulty);
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/difficulty-levels/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const validationError = validateParamsWithMessage({ id }, [
      { name: 'id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.deleteDifficultyLevel(Number(id));
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/user-question-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateParamsWithMessage(req.query, [
      { name: 'scenarios', type: 'string', required: false },
      { name: 'difficulties', type: 'string', required: false },
      { name: 'start_date', type: 'string', required: false },
      { name: 'end_date', type: 'string', required: false },
      { name: 'user_name', type: 'string', required: false }
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
        const userName = req.query.user_name ? (req.query.user_name as string).replace(' ', '') : undefined;
        const scenarios = req.query.scenarios as string | undefined;
        const difficulties = req.query.difficulties as string | undefined;
        const startDate = req.query.start_date as string | undefined;
        const endDate = req.query.end_date as string | undefined;
        const result = await getGroupedUserQuestionHistory(userName, undefined, scenarios, difficulties, startDate, endDate);
        res.json(result);
      }
    }
  
  } catch (error) {
    next(error);
  }
});

router.post('/user-roles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, role_id } = req.body;

    const validationError = validateParamsWithMessage({ user_id, role_id }, [
      { name: 'user_id', type: 'number', required: true },
      { name: 'role_id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.addUserRole(Number(user_id), Number(role_id));
      res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/user-roles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, role_id } = req.query;

    const validationError = validateParamsWithMessage({ user_id, role_id }, [
      { name: 'user_id', type: 'number', required: true },
      { name: 'role_id', type: 'number', required: true }
    ]);
    
    if (validationError) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: validationError
      };
      res.status(400).json(errorResponse);
    } else {
      await db.deleteUserRole(Number(user_id), Number(role_id));
      res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/roles', async (req: Request, res: Response, next: NextFunction) => {
  const roles = await db.getAllRoles();
  res.status(200).json(roles);
});

router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsersWithRoles();
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users with their roles: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
