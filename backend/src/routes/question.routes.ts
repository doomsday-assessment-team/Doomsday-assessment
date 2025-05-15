// routes/question.route.ts
import express from 'express';
import * as questionService from '../services/question.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const questions = await questionService.getAllQuestions();
  res.json(questions);
});

router.post('/', async (req, res) => {
  const id = await questionService.createQuestion(req.body);
  res.status(201).json({ question_id: id });
});


export default router;

