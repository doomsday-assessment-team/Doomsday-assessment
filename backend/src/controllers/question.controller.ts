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

export const editQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questionService.editQuestion(Number(req.params.id), req.body);
    res.status(200).send('Updated');
  } catch (error) {
    next(error);
  }
};

export const removeQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questionService.removeQuestion(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};