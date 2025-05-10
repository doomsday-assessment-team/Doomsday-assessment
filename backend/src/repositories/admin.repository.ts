import db from '../config/db';
import {
  Scenario,
  QuestionDifficulty,
  Question,
  Option
} from '../types/global-types';

export const addScenario = async (scenarioName: string): Promise<Scenario> => {
  return db.one<Scenario>(
    `INSERT INTO scenario(scenario_name) 
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
    `UPDATE scenario 
     SET scenario_name = $1 
     WHERE scenario_id = $2 
     RETURNING *`,
    [newScenarioName, scenarioId]
  );
};

export const deleteScenario = async (scenarioId: number): Promise<void> => {
  await db.none(
    'DELETE FROM scenario WHERE scenario_id = $1',
    [scenarioId]
  );
};

export const addOption = async (
  questionId: number,
  optionText: string,
  points: number
): Promise<Option> => {
  return db.one<Option>(
    `INSERT INTO option(question_id, option_text, points) 
     VALUES($1, $2, $3) 
     RETURNING *`,
    [questionId, optionText, points]
  );
};

export const updateOption = async (
  optionId: number,
  optionText?: string,
  points?: number
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
  
  if (updateParts.length === 0) {
    throw new Error('No fields to update. Please provide at least one of option_text or points.');
  } else {
    queryParams.push(optionId);
    const query = `
      UPDATE option 
      SET ${updateParts.join(', ')} 
      WHERE option_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<Option>(query, queryParams);
  }
};

export const deleteOption = async (optionId: number): Promise<void> => {
  await db.none(
    'DELETE FROM option WHERE option_id = $1',
    [optionId]
  );
};

export const addDifficultyLevel = async (
  difficultyName: string,
  timeLimit: number
): Promise<QuestionDifficulty> => {
  return db.one<QuestionDifficulty>(
    `INSERT INTO question_difficulty(question_difficulty_name, time) 
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
      UPDATE question_difficulty 
      SET ${updateParts.join(', ')} 
      WHERE question_difficulty_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<QuestionDifficulty>(query, queryParams);
  }
};

export const deleteDifficultyLevel = async (difficultyId: number): Promise<void> => {
  await db.none(
    'DELETE FROM question_difficulty WHERE question_difficulty_id = $1',
    [difficultyId]
  );
};

export const addQuestion = async (
  scenarioId: number,
  difficultyId: number,
  questionText: string
): Promise<Question> => {
  return db.one<Question>(
    `INSERT INTO question(question_difficulty_id, scenario_id, question_text) 
     VALUES($1, $2, $3) 
     RETURNING *`,
    [difficultyId, scenarioId, questionText]
  );
};

export const updateQuestion = async (
  questionId: number,
  difficultyId?: number,
  questionText?: string
): Promise<Question> => {
  const updateParts = [];
  const queryParams = [];
  let paramIndex = 1;

  if (difficultyId) {
    // Add question_difficulty_id field to the update query
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
  } else {
    // Skip updating question text as it wasn't provided
  }
  
  if (updateParts.length === 0) {
    throw new Error('No fields to update. Please provide at least one of question_difficulty_id or question_text.');
  } else {
    queryParams.push(questionId);
    const query = `
      UPDATE question 
      SET ${updateParts.join(', ')} 
      WHERE question_id = $${paramIndex} 
      RETURNING *
    `;
    
    return db.one<Question>(query, queryParams);
  }
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await db.none(
    'DELETE FROM question WHERE question_id = $1',
    [questionId]
  );
};