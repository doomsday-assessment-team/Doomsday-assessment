import * as scenarioRepository from '../repositories/scenario.repository';
import { Scenario } from '../types/global-types';

export const getAllScenarios = async (): Promise<Scenario[]> => {
  return await scenarioRepository.findAll();
};

export const getScenarioById = async (id: number): Promise<Scenario | null> => {
  const scenario = await scenarioRepository.findById(id);
  return scenario; 
};

export const createScenario = async (name: string): Promise<Scenario> => {
  if (!name || name.trim() === "") {
    throw new Error('Scenario name cannot be empty');
  }
  return await scenarioRepository.create(name.trim());
};

export const updateScenario = async (id: number, name: string): Promise<Scenario | null> => {
  if (!name || name.trim() === "") {
    throw new Error('Scenario name cannot be empty for update.');
  }
  const updatedScenario = await scenarioRepository.update(id, name.trim());
  if (!updatedScenario) {
    return null; 
  }
  return updatedScenario;
};

export const deleteScenario = async (id: number): Promise<boolean> => {
  const deletedCount = await scenarioRepository.remove(id);
  if (deletedCount === 0) {
    return false; 
  }
  return true;
};
