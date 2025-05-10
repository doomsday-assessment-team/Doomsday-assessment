import { ITask } from "pg-promise";
import db from "../config/db";
import { QuizModel } from "../models/quiz.model";
import { Question, QuizAttemptInput, QuizAttemptResult } from "../types/quiz";

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
    const questions = await QuizModel.findQuestionsByCriteria({scenario_id, question_difficulty_id, limit});
    if (questions.length === 0) {
      throw new ServiceError('No questions found for the given criteria.', 404);
    }
    return questions;
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

    // Use db.tx for transactions with pg-promise
    return db.tx(async (t: ITask<any>) => { // t is the transaction task object
      let totalScore = 0;
      const optionIds = selected_options.map(so => so.option_id);
      if (optionIds.some(id => isNaN(id))) {
        throw new ServiceError('Invalid option_id found in selected_options.', 400); // This will cause rollback
      }

      const pointsMap = await QuizModel.getPointsForOptions(optionIds, t); // Pass transaction task 't'

      for (const so of selected_options) {
        if (pointsMap.has(so.option_id)) {
          totalScore += pointsMap.get(so.option_id) as number;
        } else {
          console.warn(`Option ID ${so.option_id} not found for user ${userId}.`);
          throw new ServiceError('Invalid option_id found in selected_options.', 400);
        
        }
      }

      let resultTitle = "Survivor";
      let resultFeedback = "You made it through!";

      const { history_id, timestamp } = await QuizModel.createHistory(userId, t); // Pass 't'
      await QuizModel.createHistoryQuestions(history_id, selected_options, t); // Pass 't'

      // If any query within this t.tx block throws an error, pg-promise automatically rolls back.
      // If it completes without error, pg-promise automatically commits.

      return {
        history_id,
        user_id: userId,
        timestamp,
        total_score: totalScore,
        scenario_id,
        result_title: resultTitle,
        result_feedback: resultFeedback,
      };
    }).catch((error: any) => {
      // Handle errors from the transaction
      console.error('Error in submitAttempt transaction:', error);
      if (error.code && error.code.startsWith('23')) { // PostgreSQL integrity constraint
        throw new ServiceError('Invalid input data. Please check scenario, question, or option IDs.', 400);
      }
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to submit quiz attempt during transaction.', 500);
    });
  }
}
