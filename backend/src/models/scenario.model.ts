import db from '../config/db';

export const findAllScenarios = async () => {
  return await db.any(
    `SELECT scenario_id, scenario_name FROM scenario ORDER BY scenario_id ASC`
  );
};
