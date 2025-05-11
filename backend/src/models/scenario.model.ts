import db from '../config/db';

export const findAllScenarios = async () => {
  return await db.any(
    `SELECT scenario_id, scenario_name FROM scenario ORDER BY scenario_id ASC`
  );
};

export const insertScenario = async (name: string) => {
  return await db.one(
    `INSERT INTO scenario (scenario_name)
     VALUES ($1)
     RETURNING *`,
    [name]
  );
};

export const removeScenarioById = async (id: number) => {
  return await db.result(
    'DELETE FROM scenario WHERE scenario_id = $1',
    [id]
  );
};