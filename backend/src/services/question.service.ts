import * as questionRepository from '../repositories/question.repository';
import { Question, Option } from '../types/global-types'; 

export interface QuestionInputService {
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: Array<{ option_text: string; points: number }>; 
}

export const getAllQuestions = async (): Promise<questionRepository.QuestionWithDetails[]> => {
  console.log("Fetching all questions find all");
  return await questionRepository.findAll();
};

export const createQuestion = async (req: unknown, res: unknown, next: unknown, data: QuestionInputService): Promise<Question> => {
  if (!data.question_text || data.question_text.trim() === "") {
    throw new Error("Question text cannot be empty.");
  }
  if (data.options === undefined || !Array.isArray(data.options)) {
      throw new Error("Options must be an array, even if empty.");
  }

  
  const repoInput: questionRepository.QuestionInputRepository = {
      question_text: data.question_text,
      scenario_id: data.scenario_id,
      question_difficulty_id: data.question_difficulty_id,
      options: data.options
  };
  return await questionRepository.create(repoInput);
};

export const updateQuestion = async (id: number, p0: number | undefined, p1: number | undefined, p2: string | undefined, data: QuestionInputService): Promise<Question | null> => {
  if (!data.question_text || data.question_text.trim() === "") {
    throw new Error("Question text cannot be empty for update.");
  }
   if (data.options === undefined || !Array.isArray(data.options)) {
      throw new Error("Options must be an array for update, even if empty.");
  }

   const repoInput: questionRepository.QuestionInputRepository = {
      question_text: data.question_text,
      scenario_id: data.scenario_id,
      question_difficulty_id: data.question_difficulty_id,
      options: data.options
  };
  const updatedQuestion = await questionRepository.update(id, repoInput);
   if (!updatedQuestion) {

    return null;
  }
  return updatedQuestion;
};

export const deleteQuestion = async (req: unknown, res: unknown, next: unknown, id: number): Promise<boolean> => {
  const deletedCount = await questionRepository.remove(id);
   if (deletedCount === 0) {

    return false;
  }
  return true;
};
