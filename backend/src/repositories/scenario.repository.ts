import db from '../config/db';
import { Scenario } from '../types/global-types'; 

export const findAll = async (): Promise<Scenario[]> => {
  return db.any<Scenario>(`SELECT scenario_id, scenario_name FROM scenarios ORDER BY scenario_id ASC`);
};

export const findById = async (scenarioId: number): Promise<Scenario | null> => {
  return db.oneOrNone<Scenario>(
    `SELECT scenario_id, scenario_name FROM scenarios WHERE scenario_id = $1`,
    [scenarioId]
  );
};

export const create = async (scenarioName: string): Promise<Scenario> => {
  return db.one<Scenario>(
    `INSERT INTO scenarios(scenario_name) VALUES($1) RETURNING scenario_id, scenario_name`,
    [scenarioName]
  );
};

export const update = async (scenarioId: number, scenarioName: string): Promise<Scenario | null> => {
  return db.oneOrNone<Scenario>(
    `UPDATE scenarios SET scenario_name = $1 WHERE scenario_id = $2 RETURNING scenario_id, scenario_name`,
    [scenarioName, scenarioId]
  );
};

export const remove = async (scenarioId: number): Promise<number> => {
  const result = await db.result('DELETE FROM scenarios WHERE scenario_id = $1', [scenarioId]);
  return result.rowCount;
};
