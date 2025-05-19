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


router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question_text, scenario_id, question_difficulty_id, options } = req.body;
    if (question_text === undefined || typeof question_text !== 'string' || question_text.trim() === '' ||
        scenario_id === undefined || typeof scenario_id !== 'number' ||
        question_difficulty_id === undefined || typeof question_difficulty_id !== 'number') {
        return res.status(400).json({ message: "Missing or invalid required fields: question_text (string), scenario_id (number), question_difficulty_id (number)." });
    }
    if (options === undefined || !Array.isArray(options)) { 
        return res.status(400).json({ message: "Field 'options' must be an array (can be empty)." });
    }

    const newQuestion = await questionService.createQuestion(req.body);
    res.status(201).json(newQuestion);
  } catch (error) {
     if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint') || 
            error.message.includes('unique_question_per_scenario')) { 
            return res.status(409).json({ message: 'This question already exists for the selected scenario or violates a unique constraint.' });
        }
        if (error.message.includes('Duplicate option_text values') || 
            error.message.includes('unique_option_per_question')) {
            return res.status(400).json({ message: `Duplicate option text found or options violate uniqueness: ${error.message}` });
        }
        if (error.message.includes('cannot be empty') || error.message.includes('must be an array')) {
            return res.status(400).json({ message: error.message });
        }
    }
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid question ID format in URL.' });
    }

    const { question_text, scenario_id, question_difficulty_id, options } = req.body;
    if (question_text === undefined || typeof question_text !== 'string' || question_text.trim() === '' ||
        scenario_id === undefined || typeof scenario_id !== 'number' ||
        question_difficulty_id === undefined || typeof question_difficulty_id !== 'number') {
        return res.status(400).json({ message: "Missing or invalid required fields for update: question_text (string), scenario_id (number), question_difficulty_id (number)." });
    }
     if (options === undefined || !Array.isArray(options)) { 
        return res.status(400).json({ message: "Field 'options' must be an array for update (can be empty if clearing all options)." });
    }

    const updatedQuestion = await questionService.updateQuestion(id, req.body);
    if (!updatedQuestion) {
        return res.status(404).json({ message: `Question with ID ${id} not found or update failed.` });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint') ||
            error.message.includes('unique_question_per_scenario')) {
            return res.status(409).json({ message: 'This question update would conflict with an existing question in the scenario or violate a unique constraint.' });
        }
        if (error.message.includes('Duplicate option_text values') ||
            error.message.includes('unique_option_per_question')) {
            return res.status(400).json({ message: `Duplicate option text found or options violate uniqueness during update: ${error.message}` });
        }
        if (error.message.includes('cannot be empty') || error.message.includes('must be an array')) {
            return res.status(400).json({ message: error.message });
        }
    }
    next(error);
  }
});


router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid question ID format in URL.' });
    }
    const success = await questionService.deleteQuestion(id);
    if (!success) {
        return res.status(404).json({ message: `Question with ID ${id} not found or could not be deleted.` });
    }
    res.status(204).send(); 
  } catch (error) { 
    if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

export default router;
