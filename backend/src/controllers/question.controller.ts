import { Request, Response, NextFunction } from 'express';
import * as questionService from '../services/question.service';
import { ApiResponse } from '../types/api-response';

export const getAllQuestions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await questionService.getAllQuestions();
    const response: ApiResponse<typeof questions> = { data: questions };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = await questionService.createQuestion(req.body);
    res.status(201).json({ question_id: id });
  } catch (error) {
    next(error);
  }
};

