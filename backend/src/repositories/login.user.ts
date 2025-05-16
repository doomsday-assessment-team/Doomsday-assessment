import { DBPool } from '../db/pool';

export async function loginUser(
  name: string,
  surname: string,
  google_subject: string
) {
  const client = await DBPool.connect();

  try {
    await client.query('BEGIN');

    let userResult = await client.query(
      `
      SELECT 
        u.user_id,
        u.name,
        u.surname,
        u.google_subject,
        ARRAY_AGG(r.role_name) AS roles
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.google_subject = $1
      GROUP BY u.user_id
      `,
      [google_subject]
    );

    if (userResult.rows.length > 0) {
      await client.query('COMMIT');
      return userResult.rows[0];
    }

    const insertUserQuery = `
      INSERT INTO users (name, surname, google_subject)
      VALUES ($1, $2, $3)
      RETURNING user_id;
    `;
    const inserted = await client.query(insertUserQuery, [
      name,
      surname,
      google_subject
    ]);
    const userId = inserted.rows[0].user_id;

    const insertUserRoleQuery = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, 1)
    `;
    await client.query(insertUserRoleQuery, [userId]);

    userResult = await client.query(
      `
      SELECT 
        u.user_id,
        u.name,
        u.surname,
        u.google_subject,
        ARRAY_AGG(r.role_name) AS roles
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = $1
      GROUP BY u.user_id
      `,
      [userId]
    );

    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
