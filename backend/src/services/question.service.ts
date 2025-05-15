import * as questionModel from '../models/question.model';


export const getAllQuestions = async () => {
  return await questionModel.findAllQuestions();
};

export const createQuestion = async (data: {
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: { option_text: string; points: number }[];
}) => {
  return await questionModel.addQuestion(data);
};

export const editQuestion = async (
  id: number,
  data: {
    question_text: string;
    options: { option_text: string; points: number }[];
  }
) => {
  return await questionModel.updateQuestion(id, data);
};

export const removeQuestion = async (id: number) => {
  return await questionModel.deleteQuestion(id);
};
