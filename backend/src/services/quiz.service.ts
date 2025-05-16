import { ITask } from "pg-promise";
import db from "../config/db";
import { Question, QuizAttemptInput, QuizAttemptResult } from "../types/quiz";
import { createHistory, createHistoryQuestions, findQuestionsByCriteria, getPointsForOptions, getQuestion, updateQuestions } from "../repositories/quiz.repository";
import { DatabaseError } from "pg-protocol";
import { getgeminiFeedback } from "../routes/quiz.routes";

// Custom Error class for better status code handling
export class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export class QuizService {
  static async getQuestions({
    scenario_id,
    question_difficulty_id,
    limit,
  }: {
    scenario_id: number;
    question_difficulty_id?: number;
    limit?: number;
  }): Promise<Question[]> {
    if (isNaN(scenario_id)) {
      throw new ServiceError('scenario_id must be a number', 400);
    }

    const questions = await findQuestionsByCriteria({ scenario_id, question_difficulty_id, limit });

    if (questions.length === 0) {
      throw new ServiceError('No questions found for the given criteria.', 404);
    }
    return questions;
  }

  static async updateQuestion({ question_id, question_text }: { question_id: number, question_text: string }) {

    if (isNaN(question_id)) {
      throw new ServiceError('scenario_id must be a number', 400);
    }

    const qResult = await getQuestion(question_id);

    if (qResult == null) {
      throw new ServiceError('No questions found for the given criteria.', 404);
    }

    const result = await updateQuestions(question_id, question_text);

    return result;

  }

  static async submitAttempt({
    userId,
    attemptInput,
  }: {
    userId: number;
    attemptInput: QuizAttemptInput;
  }): Promise<QuizAttemptResult> {
    const { scenario_id, selected_options } = attemptInput;

    if (isNaN(scenario_id) || !selected_options || !Array.isArray(selected_options) || selected_options.length === 0) {
      throw new ServiceError('scenario_id and a non-empty array of selected_options are required.', 400);
    }

    return db.tx(async (t: ITask<any>) => {
      let totalScore = 0;
      const optionIds = selected_options.map(so => so.option_id);
      if (optionIds.some(id => isNaN(id))) {
        throw new ServiceError('Invalid option_id found in selected_options.', 400);
      }

      const pointsMap = await getPointsForOptions(optionIds, t);

      for (const so of selected_options) {
        if (pointsMap.has(so.option_id)) {
          totalScore += pointsMap.get(so.option_id) as number;
        } else {
          console.warn(`Option ID ${so.option_id} not found for user ${userId}.`);
          throw new ServiceError('Invalid option_id found in selected_options.', 400);
        }
      }

      let resultTitle = "Survivor";

      let geminiFeedback = await getgeminiFeedback(attemptInput) ?? '';

      const { history_id, timestamp, feedback } = await createHistory(userId, geminiFeedback.substring(0, 253), t);
      await createHistoryQuestions(history_id, selected_options, t);

      return {
        history_id,
        user_id: userId,
        timestamp,
        total_score: totalScore,
        scenario_id,
        result_title: resultTitle,
        result_feedback: feedback,
      };
    }).catch((error: any) => {
      console.error(error);
      if (error instanceof DatabaseError && error.code) {
        throw new ServiceError('Invalid input data. Please check scenario, question, or option IDs.', 400);
      } else if (error instanceof ServiceError) throw error;
      else throw new ServiceError('Failed to submit quiz attempt during transaction.', 500);
    });
  }
}
