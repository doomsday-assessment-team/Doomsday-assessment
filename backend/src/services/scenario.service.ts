import * as scenarioModel from '../models/scenario.model';

export const getAllScenarios = async () => {
  return await scenarioModel.findAllScenarios();
};

export const createScenario = async (name: string) => {
  return await scenarioModel.insertScenario(name);
};

export const deleteScenario = async (id: number) => {
  const result = await scenarioModel.removeScenarioById(id);
  return result.rowCount;
};