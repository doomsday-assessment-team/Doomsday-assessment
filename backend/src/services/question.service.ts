import { addQuestion, findAllQuestions } from "../repositories/question.repository";


export const getAllQuestions = async () => {
  return await findAllQuestions();
};

export const createQuestion = async (data: {
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: { option_text: string; points: number }[];
}) => {
  return await addQuestion(data);
};
