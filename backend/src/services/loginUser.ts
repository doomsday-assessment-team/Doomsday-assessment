import { DBPool } from '../db/pool'

export async function loginUser(name:string, surname: string, email: string, google_subject: string) {
  const existing = await DBPool.query('SELECT * FROM users WHERE google_subject = $1', [google_subject]);

  if (existing.rows.length > 0) {
    return existing.rows[0].user_id;
  }
  // Should we use a trigger, or just handle it in the logic since it's central?? 
  const insertQuery = `
    INSERT INTO users (name, surname, email, google_subject)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id;
  `;
  const result = await DBPool.query(insertQuery, [name, surname, email, google_subject]);
    const insertQueryRole = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES ($1, 1)
  `;
  await DBPool.query(insertQueryRole, [result.rows[0].user_id]);
  return result.rows[0];
}
