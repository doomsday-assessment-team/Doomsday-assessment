import { DBPool } from '../db/pool'

export async function loginUser(
  name: string,
  surname: string,
  email: string,
  google_subject: string
) {
  let userResult = await DBPool.query(
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
    return userResult.rows[0];
  }

  const insertUserQuery = `
    INSERT INTO users (name, surname, email, google_subject)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id;
  `;
  const inserted = await DBPool.query(insertUserQuery, [name, surname, email, google_subject]);

  const userId = inserted.rows[0].user_id;

  // Should we rather use a trigger or keep it in the logic since it's central :? 
  const insertUserRoleQuery = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES ($1, 1)
  `;
  await DBPool.query(insertUserRoleQuery, [userId]);

  userResult = await DBPool.query(
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

  return userResult.rows[0];
}