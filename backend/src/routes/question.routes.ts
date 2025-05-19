import express, { Request, Response, NextFunction } from 'express';
import * as questionService from "../services/question.service"; 

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.json(questions); 
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question_text, scenario_id, question_difficulty_id } = req.body;
    let { options } = req.body; 

    if (question_text === undefined || typeof question_text !== 'string' || question_text.trim() === '' ||
        scenario_id === undefined || typeof scenario_id !== 'number' ||
        question_difficulty_id === undefined || typeof question_difficulty_id !== 'number') {
      res.status(400).json({ message: "Missing or invalid required fields: question_text (string), scenario_id (number), question_difficulty_id (number)." });
      return;
    }

    if (options === undefined) { 
      options = []; 
    } else if (!Array.isArray(options)) {
      res.status(400).json({
        message: "Field 'options' must be an array if provided.",
      });
      return;
    }

    const newQuestion = await questionService.createQuestion({
        question_text,
        scenario_id,
        question_difficulty_id,
        options 
    });
    res.status(201).json(newQuestion);
  } catch (error) {
    if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint') || 
            error.message.includes('unique_question_per_scenario')) { 
            res.status(409).json({ message: 'This question conflicts with an existing question in the scenario or violates a unique constraint.' });
            return;
        }
        if (error.message.includes('Duplicate option_text values') || 
            error.message.includes('unique_option_per_question')) {
            res.status(400).json({
                message: `Duplicate option text found or options violate uniqueness: ${error.message}`,
            });
            return;
        }
        if (error.message.includes('cannot be empty') || error.message.includes('must be an array')) {
          res.status(400).json({ message: error.message });
          return;
        }
    }
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid question ID format in URL.' });
      return;
    }

    const { question_text, scenario_id, question_difficulty_id, options } = req.body;
    if (
      question_text === undefined ||
      typeof question_text !== 'string' ||
      question_text.trim() === '' ||
      scenario_id === undefined ||
      typeof scenario_id !== 'number' ||
      question_difficulty_id === undefined ||
      typeof question_difficulty_id !== 'number'
    ) {
      res.status(400).json({
        message:
          'Missing or invalid required fields for update: question_text (string), scenario_id (number), question_difficulty_id (number).',
      });
      return;
    }
    
   
    if (options !== undefined && !Array.isArray(options)) {
      res.status(400).json({
        message:
          "If 'options' field is provided, it must be an array.",
      });
      return;
    }

    const payloadForService = {
        question_text: question_text,
        scenario_id: scenario_id,
        question_difficulty_id: question_difficulty_id,
        options: Array.isArray(options) ? options : [] // Ensure service always gets an array for options
    };

    const updatedQuestion = await questionService.updateQuestion(id, payloadForService);
    if (!updatedQuestion) {
      res.status(404).json({ message: `Question with ID ${id} not found or update failed.` });
      return;
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('duplicate key value violates unique constraint') ||
        error.message.includes('unique_question_per_scenario')
      ) {
        res.status(409).json({
          message:
            'This question update would conflict with an existing question in the scenario or violate a unique constraint.',
        });
        return;
      }
      if (
        error.message.includes('Duplicate option_text values') ||
        error.message.includes('unique_option_per_question')
      ) {
        res.status(400).json({
          message: `Duplicate option text found or options violate uniqueness during update: ${error.message}`,
        });
        return;
      }
      if (error.message.includes('cannot be empty') || error.message.includes('must be an array')) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message.includes('not found')) {
         res.status(404).json({ message: error.message });
         return;
      }
    }
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid question ID format in URL.' });
      return; 
    }
    const success = await questionService.deleteQuestion(id);
    if (!success) {
      res.status(404).json({ message: `Question with ID ${id} not found or delete failed (possibly in use).` });
      return; 
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
});

export default router;
