import * as scenarioModel from '../models/scenario.model';

export const getAllScenarios = async () => {
  return await scenarioModel.findAllScenarios();
};
