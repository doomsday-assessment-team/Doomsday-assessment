import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';
import { QuizAttemptInput } from '../types/quiz';

export class QuizController {

    static async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const scenarioIdParam = req.query.scenario_id as string | undefined;
            const difficultyIdParam = req.query.question_difficulty_id as string | undefined;
            const limitParam = req.query.limit as string | undefined;

            if (!scenarioIdParam) {
                res.status(400).json({ error: 'scenario_id query parameter is required' });
                return;
            }
            const scenario_id = parseInt(scenarioIdParam, 10);
            if (isNaN(scenario_id)) {
                res.status(400).json({ error: 'scenario_id must be a number' });
                return;
            }

            const questions = await QuizService.getQuestions({
                scenario_id,
                question_difficulty_id: difficultyIdParam ? parseInt(difficultyIdParam, 10) : undefined,
                limit: limitParam ? parseInt(limitParam, 10) : undefined,
            });
            res.json(questions);
        } catch (error) {
            next(error); // Pass to centralized error handler
        }
    }

    static async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const attemptInput = req.body as QuizAttemptInput; // Basic type assertion
            // const user = req.user;

            // if (!user || typeof user.user_id !== 'number') {
            //     // This should ideally be caught by auth middleware, but good to double check
            //     res.status(401).json({ error: 'User not authenticated or user_id missing from token' });
            //     return;
            // }

            // More robust validation of attemptInput can be done here or in the service
            if (isNaN(attemptInput.scenario_id)) {
                res.status(400).json({ error: 'scenario_id must be a number' });
                return;
            }


            const result = await QuizService.submitAttempt({
                userId: 1,
                attemptInput,
            });
            res.status(201).json(result);
        } catch (error) {
            next(error); // Pass to centralized error handler
        }
    }
}