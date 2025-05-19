import * as scenarioRepository from '../repositories/scenario.repository'; 
import { Scenario } from '../types/global-types';

export const getAllScenarios = async (): Promise<Scenario[]> => {
  const scenarios = await scenarioRepository.findAll(); 
  return scenarios;
};

export const getScenarioById = async (id: number): Promise<Scenario | null> => {
  const scenario = await scenarioRepository.findById(id); 
  if (!scenario) {
    console.log(`[Service] getScenarioById: Scenario with ID ${id} not found.`);
  } else {
    console.log(`[Service] getScenarioById: Found scenario:`, scenario);
  }
  return scenario; 
};

export const createScenario = async (name: string): Promise<Scenario> => {
  if (!name || name.trim() === "") {
    throw new Error('Scenario name cannot be empty');
  }
  const newScenario = await scenarioRepository.create(name.trim()); 
  return newScenario;
};

export const updateScenario = async (id: number, name: string): Promise<Scenario | null> => {
  if (!name || name.trim() === "") {
    throw new Error('Scenario name cannot be empty for update.');
  }
  const updatedScenario = await scenarioRepository.update(id, name.trim()); 
  if (!updatedScenario) {

  } else {
  }
  return updatedScenario;
};

export const deleteScenario = async (id: number): Promise<boolean> => {

  const deletedCount = await scenarioRepository.remove(id); // Assuming remove is the method
  if (deletedCount === 0) {


    return false; 
  }
  return true;
};
