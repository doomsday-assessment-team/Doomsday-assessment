import * as scenarioRepository from '../repositories/scenario.repository'; 
import { Scenario } from '../types/global-types';

export const getAllScenarios = async (): Promise<Scenario[]> => {
  console.log('[Service] getAllScenarios: Fetching all scenarios from repository.');
  const scenarios = await scenarioRepository.findAll(); 
  console.log('[Service] getAllScenarios: Found scenarios count:', scenarios.length);
  return scenarios;
};

export const getScenarioById = async (id: number): Promise<Scenario | null> => {
  console.log(`[Service] getScenarioById: Fetching scenario with ID: ${id}`);
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
    console.error('[Service] createScenario: Validation failed - Scenario name cannot be empty.');
    throw new Error('Scenario name cannot be empty');
  }
  console.log(`[Service] createScenario: Creating scenario with name: ${name.trim()}`);
  const newScenario = await scenarioRepository.create(name.trim()); 
  console.log(`[Service] createScenario: Created scenario:`, newScenario);
  return newScenario;
};

export const updateScenario = async (id: number, name: string): Promise<Scenario | null> => {
  if (!name || name.trim() === "") {
    console.error(`[Service] updateScenario: Validation failed for ID ${id} - Scenario name cannot be empty.`);
    throw new Error('Scenario name cannot be empty for update.');
  }
  console.log(`[Service] updateScenario: Updating scenario ID ${id} with name: ${name.trim()}`);
  const updatedScenario = await scenarioRepository.update(id, name.trim()); 
  if (!updatedScenario) {
    console.log(`[Service] updateScenario: Scenario with ID ${id} not found or update failed.`);

  } else {
    console.log(`[Service] updateScenario: Updated scenario:`, updatedScenario);
  }
  return updatedScenario;
};

export const deleteScenario = async (id: number): Promise<boolean> => {
  console.log(`[Service] deleteScenario: Deleting scenario with ID: ${id}`);

  const deletedCount = await scenarioRepository.remove(id); // Assuming remove is the method
  if (deletedCount === 0) {
    console.log(`[Service] deleteScenario: Scenario with ID ${id} not found or delete failed.`);

    return false; 
  }
  console.log(`[Service] deleteScenario: Scenario with ID ${id} deleted successfully.`);
  return true;
};
