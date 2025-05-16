import db from '../config/db';
import {
  Scenario,
  QuestionDifficulty,
  Question,
  Option,
  Role
} from '../types/global-types';
import { RawUserQuestionRow } from '../types/raw-user-question-row';

export const addScenario = async (scenarioName: string): Promise<Scenario> => {
  return db.one<Scenario>(
    `INSERT INTO scenarios(scenario_name) 
     VALUES($1) 
     RETURNING *`,
    [scenarioName]
  );
};

export const updateScenario = async (
  scenarioId: number,
  newScenarioName: string
): Promise<Scenario> => {
  return db.one<Scenario>(
    `UPDATE scenarios 
     SET scenario_name = $1 
     WHERE scenario_id = $2 
     RETURNING *`,
    [newScenarioName, scenarioId]
  );
};

export const deleteScenario = async (scenarioId: number): Promise<void> => {
  await db.none(
    'DELETE FROM scenarios WHERE scenario_id = $1',
    [scenarioId]
  );
};

export const addOption = async (
  questionId: number,
  optionText: string,
  points: number
): Promise<Option> => {
  return db.one<Option>(
    `INSERT INTO options(question_id, option_text, points) 
     VALUES($1, $2, $3) 
     RETURNING *`,
    [questionId, optionText, points]
  );
};

export const updateOption = async (
  optionId: number,
  optionText?: string,
  points?: number,
  questionId?: number
): Promise<Option> => {
  const updateParts = [];
  const queryParams = [];
  let paramIndex = 1;

  if (optionText) {
    updateParts.push(`option_text = $${paramIndex}`);
    queryParams.push(optionText);
    paramIndex++;
  } else {
    // Skip updating option_text as it wasn't provided
  }
  
  if (points) {
    updateParts.push(`points = $${paramIndex}`);
    queryParams.push(points);
    paramIndex++;
  } else {
    // Skip updating points as it wasn't provided
  }

  if (questionId) {
    updateParts.push(`question_id = $${paramIndex}`);
    queryParams.push(questionId);
    paramIndex++;
  } else {
    // Skip updating questionId as it wasn't provided
  }
  
  if (updateParts.length === 0) {
    throw new Error('No fields to update. Please provide at least one of option_text or points.');
  } else {
    queryParams.push(optionId);
    const query = `
      UPDATE options 
      SET ${updateParts.join(', ')} 
      WHERE option_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<Option>(query, queryParams);
  }
};

export const deleteOption = async (optionId: number): Promise<void> => {
  await db.none(
    'DELETE FROM options WHERE option_id = $1',
    [optionId]
  );
};

export const addDifficultyLevel = async (
  difficultyName: string,
  timeLimit: number
): Promise<QuestionDifficulty> => {
  return db.one<QuestionDifficulty>(
    `INSERT INTO question_difficulties(question_difficulty_name, time) 
     VALUES($1, $2) 
     RETURNING *`,
    [difficultyName, timeLimit]
  );
};

export const updateDifficultyLevel = async (
  difficultyId: number,
  difficultyName?: string,
  timeLimit?: number
): Promise<QuestionDifficulty> => {
  const updateParts = [];
  const queryParams = [];
  let paramIndex = 1;

  if (difficultyName) {
    updateParts.push(`question_difficulty_name = $${paramIndex}`);
    queryParams.push(difficultyName);
    paramIndex++;
  } else {
    // Skip updating difficulty name as it wasn't provided
  }
  
  if (timeLimit) {
    updateParts.push(`time = $${paramIndex}`);
    queryParams.push(timeLimit);
    paramIndex++;
  } else {
    // Skip updating time as it wasn't provided
  }

  if (updateParts.length === 0) {
    throw new Error('No fields to update. Please provide at least one of question_difficulty_name or time.');
  } else {
    queryParams.push(difficultyId);
    const query = `
      UPDATE question_difficulties 
      SET ${updateParts.join(', ')} 
      WHERE question_difficulty_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<QuestionDifficulty>(query, queryParams);
  }
};

export const deleteDifficultyLevel = async (difficultyId: number): Promise<void> => {
  await db.none(
    'DELETE FROM question_difficulties WHERE question_difficulty_id = $1',
    [difficultyId]
  );
};

export const addQuestion = async (
  scenarioId: number,
  difficultyId: number,
  questionText: string
): Promise<Question> => {
  return db.one<Question>(
    `INSERT INTO questions(question_difficulty_id, scenario_id, question_text) 
     VALUES($1, $2, $3) 
     RETURNING *`,
    [difficultyId, scenarioId, questionText]
  );
};

export const updateQuestion = async (
  questionId: number,
  difficultyId?: number,
  scenarioId?: number,
  questionText?: string
): Promise<Question> => {
  const updateParts = [];
  const queryParams = [];
  let paramIndex = 1;

  if (difficultyId) {
    updateParts.push(`question_difficulty_id = $${paramIndex}`);
    queryParams.push(difficultyId);
    paramIndex++;
  } else {
    // Skip updating difficulty ID as it wasn't provided
  }
  
  if (questionText) {
    updateParts.push(`question_text = $${paramIndex}`);
    queryParams.push(questionText);
    paramIndex++;
  }  else {
    // Skip updating question text as it wasn't provided
  }

  if (scenarioId) {
    updateParts.push(`scenario_id = $${paramIndex}`);
    queryParams.push(scenarioId);
    paramIndex++;
  }  else {
    // Skip updating scenario as it wasn't provided
  }
  
  if (updateParts.length === 0) {
    throw new Error('No fields to update. Please provide at least one of question_difficulty_id or question_text.');
  } else {
    queryParams.push(questionId);
    const query = `
      UPDATE questions 
      SET ${updateParts.join(', ')} 
      WHERE question_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<Question>(query, queryParams);
  }
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await db.none(
    'DELETE FROM questions WHERE question_id = $1',
    [questionId]
  );
};

export const getUserQuestionHistory = async (
  userName?: string,
  userId?: number,
  scenarios?: string,
  difficulties?: string,
  startDate?: string,
  endDate?: string,
  offset: number = 0,
  itemsPerPage: number = 100
): Promise<RawUserQuestionRow[]> => {
  const whereConditions = [];
  const queryParams: any[] = [];
  let paramCounter = 1;
  let whereUserCondition = '';

  if (userName !== undefined) {
    whereUserCondition = `
      WHERE CONCAT(surname, name) ILIKE '%' || $${paramCounter} || '%' OR 
      CONCAT(name, surname) ILIKE '%' || $${paramCounter++} || '%'
    `;
    queryParams.push(userName);
  }

  if (userId !== undefined) {
    whereConditions.push(`u.user_id = $${paramCounter++}`);
    queryParams.push(userId);
  }

  if (scenarios !== undefined) {
    whereConditions.push(`q.scenario_id = ANY(string_to_array($${paramCounter++}, ',')::int[])`);
    queryParams.push(scenarios);
  }

  if (difficulties !== undefined) {
    whereConditions.push(`q.question_difficulty_id = ANY(string_to_array($${paramCounter++}, ',')::int[])`);
    queryParams.push(difficulties);
  }

  if (startDate) {
    whereConditions.push(`h.timestamp >= $${paramCounter++}`);
    queryParams.push(new Date(startDate));
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    whereConditions.push(`h.timestamp <= $${paramCounter++}`);
    queryParams.push(end);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const query = `
    WITH limited_histories AS (
      SELECT history_id, timestamp, user_id, feedback
      FROM history
      ORDER BY history_id
      LIMIT $${paramCounter++}
      OFFSET $${paramCounter++}
    ), filtered_users AS (
      SELECT user_id, surname, name FROM users
      ${whereUserCondition}
    ) 
    SELECT
      u.user_id,
      u.name,
      u.surname,
      s.scenario_name,
      qd.question_difficulty_id AS difficulty_id,
      qd.question_difficulty_name AS difficulty_name,
      q.question_id,
      q.scenario_id,
      q.question_text,
      so.option_id AS selected_option_id,
      o.points,
      o.option_id,
      o.option_text,
      h.timestamp,
      h.history_id,
      h.feedback
    FROM history_questions hq
    INNER JOIN limited_histories h ON hq.history_id = h.history_id
    INNER JOIN filtered_users u ON h.user_id = u.user_id
    INNER JOIN options so ON hq.option_id = so.option_id
    INNER JOIN questions q ON hq.question_id = q.question_id
    LEFT JOIN options o ON q.question_id = o.question_id
    INNER JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    INNER JOIN scenarios s ON q.scenario_id = s.scenario_id
    ${whereClause}
  `;
  queryParams.push(itemsPerPage, offset);
  return db.manyOrNone<RawUserQuestionRow>(query, queryParams);
};

export const addUserRole = async (userId: number, roleId: number) => {
  const exists = await db.oneOrNone(
    `SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2`,
    [userId, roleId]
  );

  if (exists) {
    throw new Error("User already has this role.");
  }

  return db.one(
    `INSERT INTO user_roles (user_id, role_id) 
     VALUES ($1, $2) 
     RETURNING user_role_id`,
    [userId, roleId]
  );
};

export const deleteUserRole = async (userName: number, roleId: number) => {
  return db.none(
    `DELETE FROM user_roles 
     WHERE user_id = $1 AND role_id = $2`,
    [userName, roleId]
  );
};

export const getAllRoles = async (): Promise<Role[]> => {
  return db.any(
    `SELECT role_id, role_name FROM roles`
  );
};

export async function getAllUsersWithRoles() {
  const usersRoleResult = await db.any ( 
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
    GROUP BY u.user_id
    `
  );

  return usersRoleResult;
}