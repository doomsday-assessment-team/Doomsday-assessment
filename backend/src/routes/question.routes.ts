import { Router } from "express";
import express, { Request, Response, NextFunction } from 'express';
import { createQuestion, deleteQuestion, getAllQuestions } from "../services/question.service";
import { updateQuestion } from "../repositories/admin.repository";



const router = express.Router();


router.get('/questions', async () => {
  try {
    await getAllQuestions();
  } catch (error) { 
  }
});

router.post('/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createQuestion(req, res, next, req.body);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Pass id and other required fields to the controller
    await updateQuestion(
      Number(id),
      req.body.question_difficulty_id ? Number(req.body.question_difficulty_id) : undefined,
      req.body.scenario_id ? Number(req.body.scenario_id) : undefined,
      req.body.question_text as string | undefined
    );
    res.status(200).json({ message: 'Question updated successfully.' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deleteQuestion(req, res, next, Number(id));
  } catch (error) {
    next(error);
  }
});

export default router;
