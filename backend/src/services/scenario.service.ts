import { findAllScenarios } from "../repositories/quiz.repository";

export const getAllScenarios = async () => {
  return await findAllScenarios();
};
