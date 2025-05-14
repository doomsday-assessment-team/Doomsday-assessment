import { DBPool } from '../db/pool';

export async function loginUser(
  name: string,
  surname: string,
  email: string,
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
        u.email,
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

    // Check if email exists (had an iffy edge case where there was an email - subject mismatch :?)
    const existingEmail = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email]
    );

    if (existingEmail.rows.length > 0) {
      await client.query(
        `UPDATE users SET google_subject = $1 WHERE email = $2`,
        [google_subject, email]
      );

      const userId = existingEmail.rows[0].user_id;

      userResult = await client.query(
        `
        SELECT 
          u.user_id,
          u.name,
          u.surname,
          u.email,
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
    }

    const insertUserQuery = `
      INSERT INTO users (name, surname, email, google_subject)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id;
    `;
    const inserted = await client.query(insertUserQuery, [
      name,
      surname,
      email,
      google_subject
    ]);
    const userId = inserted.rows[0].user_id;

    // Defaulting to a normal user when logging in
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
        u.email,
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
