import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";


const router = Router();

router.get('/questions', QuizController.getQuestions);

router.post('/attempts', QuizController.submitAttempt);

export default router;