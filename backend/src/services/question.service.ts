import * as questionRepository from '../repositories/question.repository';
import { Question } from '../types/global-types';
import { QuestionWithDetails, QuestionInputRepository } from '../repositories/question.repository';

export interface QuestionInputService extends QuestionInputRepository {}

export const getAllQuestions = async (): Promise<QuestionWithDetails[]> => {
  const questions = await questionRepository.findAll();
  return questions;
};

export const createQuestion = async (data: QuestionInputService): Promise<Question> => {
  if (!data.question_text || data.question_text.trim() === "") {
    throw new Error("Question text cannot be empty.");
  }
  if (data.options === undefined || !Array.isArray(data.options)) {
      throw new Error("Options must be an array, even if empty.");
  }
  
  const createdQuestion = await questionRepository.create(data);
  return createdQuestion;
};

export const updateQuestion = async (id: number, data: QuestionInputService): Promise<Question | null> => {
  if (!data.question_text || data.question_text.trim() === "") {
    throw new Error("Question text cannot be empty for update.");
  }
   if (data.options === undefined || !Array.isArray(data.options)) {
      throw new Error("Options must be an array for update, even if empty.");
  }
  const updatedQuestion = await questionRepository.update(id, data);
   if (!updatedQuestion) {
    return null;
  }
  return updatedQuestion;
};

export const deleteQuestion = async (id: number): Promise<boolean> => {
  const deletedCount = await questionRepository.remove(id);
   if (deletedCount === 0) {
    return false;
  }
  return true;
};
