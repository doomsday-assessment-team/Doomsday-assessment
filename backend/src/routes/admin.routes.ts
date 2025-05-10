import express, { Request, Response, NextFunction } from 'express';
import * as db from '../repositories/admin.repository';
import { authenticateJWT, checkAdminRole } from '../middlewares/auth.middleware';
import { validateParamsWithMessage } from '../utils/parameter-validation';
import { ErrorResponse } from '../types/error-response';

const router = express.Router();

// router.use(authenticateJWT);
// router.use(checkAdminRole);

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
            message: 'No fields to update. Please provide at least scenario_name.'
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
        { name: 'question_text', type: 'string', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.question_difficulty_id === undefined && req.query.question_text === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'No fields to update. Please provide at least one of question_difficulty_id or question_text.'
          };
          res.status(400).json(errorResponse);
        } else {
          const question = await db.updateQuestion(
            Number(id),
            req.query.question_difficulty_id ? Number(req.query.question_difficulty_id) : undefined,
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
        { name: 'points', type: 'number', required: false }
      ]);
      
      if (validationError) {
        const errorResponse: ErrorResponse = {
          error: 'ValidationError',
          message: validationError
        };
        res.status(400).json(errorResponse);
      } else {
        if (req.query.option_text === undefined && req.query.points === undefined) {
          const errorResponse: ErrorResponse = {
            error: 'MissingFieldError',
            message: 'No fields to update. Please provide at least one of option_text or points.'
          };
          res.status(400).json(errorResponse);
        } else {
          const option = await db.updateOption(
            Number(id),
            req.query.option_text as string | undefined,
            req.query.points !== undefined ? Number(req.query.points) : undefined
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

export default router;