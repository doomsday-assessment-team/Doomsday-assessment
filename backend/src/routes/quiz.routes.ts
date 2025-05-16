import { Router } from "express";
import express, { Request, Response, NextFunction } from 'express';
import { QuizService } from "../services/quiz.service";
import { Options, QuizAttemptInput, Scenario } from "../types/quiz";
import { getOptionsbyId, getScenarioDetailsFromDB } from "../repositories/quiz.repository";
import { GoogleGenerativeAI }from "@google/generative-ai";



const router = Router();

router.get('/questions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        next(error);
    }
});

router.post('/attempts', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const attemptInput = req.body as QuizAttemptInput;
        const user = req.user;

        if (!user || typeof user.user_id !== 'number') {
            res.status(401).json({ error: 'User not authenticated or user_id missing from token' });
            return;
        }

        if (isNaN(attemptInput.scenario_id)) {
            res.status(400).json({ error: 'scenario_id must be a number' });
            return;
        }

        const result = await QuizService.submitAttempt({
            userId: user.user_id,
            attemptInput,
        });
        console.info(result);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

export const getgeminiFeedback = async (quizAttempt: QuizAttemptInput) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
        return;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
    });


    try {
        let overallPrompt = "";
        let totalPointsScored = 0;
        let maxPossiblePoints = 0;
        let questionsSummaryForPrompt = "";

        const scenarioDetails: Scenario = await getScenarioDetailsFromDB(quizAttempt.scenario_id);
        const scenarioName = scenarioDetails ? scenarioDetails.scenario_name : `Scenario ID ${quizAttempt.scenario_id}`;

        overallPrompt += `The user attempted a quiz for the "${scenarioName}" scenario.\n`;
        overallPrompt += "Here's a summary of their performance:\n\n";

        for (const selectedOpt of quizAttempt.selected_options) {
            const questionTextFromFE = selectedOpt.question_text;
            const userAnswerTextFromFE = selectedOpt.option_text;

            const allOptionsForThisQuestion: Options[] = await getOptionsbyId(selectedOpt.question_id);

            if (!allOptionsForThisQuestion || allOptionsForThisQuestion.length === 0) {
                questionsSummaryForPrompt += `Question ID ${selectedOpt.question_id} ("${questionTextFromFE}"): Options data missing. User answered "${userAnswerTextFromFE}".\n`;
                continue;
            }

            const currentMaxPointsForQuestion = Math.max(...allOptionsForThisQuestion.map(o => o.points), 0);
            maxPossiblePoints += currentMaxPointsForQuestion;

            const userAnswerFullOption = allOptionsForThisQuestion.find(opt => opt.option_id === selectedOpt.option_id);
            let userAnswerPoints = 0;
            let actualUserAnswerText = userAnswerTextFromFE;

            if (userAnswerFullOption) {
                userAnswerPoints = userAnswerFullOption.points;
                actualUserAnswerText = userAnswerFullOption.option_text;
            } else if (selectedOpt.option_id === -1 || selectedOpt.option_text === "Not Answered") {
                actualUserAnswerText = "Not Answered";
            }

            totalPointsScored += userAnswerPoints;

            questionsSummaryForPrompt += `Question: "${questionTextFromFE}"\n`;
            questionsSummaryForPrompt += "  All Options:\n";
            allOptionsForThisQuestion.forEach(opt => {
                questionsSummaryForPrompt += `    - "${opt.option_text}" (Points: ${opt.points})\n`;
            });
            questionsSummaryForPrompt += `  User's Answer: "${actualUserAnswerText}" (Awarded: ${userAnswerPoints} points)\n\n`;
        }

        overallPrompt += questionsSummaryForPrompt;
        overallPrompt += `The user's total score was ${totalPointsScored} out of a possible ${maxPossiblePoints} (if calculated).\n\n`;

        overallPrompt += "Based on this performance, provide an overall summary feedback (255 characters).\n";
        overallPrompt += "The feedback should:\n";
        overallPrompt += "1. Acknowledge their overall performance (e.g., excellent, good understanding, areas to improve).\n";
        overallPrompt += "2. Highlight one or two key strengths demonstrated by their correct or high-point answers.\n";
        overallPrompt += "3. Suggest one or two general areas for improvement based on answers that received low or zero points, without dwelling on specific wrong answers unless it's a common theme.\n";
        overallPrompt += "4. Offer a piece of general advice or encouragement related to preparedness for the given scenario.\n";
        overallPrompt += "5. Maintain an encouraging, educational, and supportive tone.\n";
        overallPrompt += "Do not list each question and answer again in your feedback; summarize the patterns.\n";
        overallPrompt += "The total number of characters on your feedback shouldn't be greater than 255.\n";


        console.log("Sending OVERALL prompt to Gemini:", overallPrompt);
        const result = await model.generateContent(overallPrompt);
        const response = await result.response;
        const summaryFeedbackText = response.text();

        console.log(summaryFeedbackText);

        return summaryFeedbackText;

    } catch (error) {
        console.error("Error processing quiz submission and getting feedback:", error);
    }
};

export default router;