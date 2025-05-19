import db from '../config/db'; // Adjust path as needed
import { Question, Option as GlobalOption } from '../types/global-types'; // Adjust path as needed

export interface QuestionWithDetails extends Question {
  question_difficulty_name: string;
  options: GlobalOption[]; 
}

export interface QuestionInputRepository {
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: Array<{ option_text: string; points: number }>;
}

export const findAll = async (): Promise<QuestionWithDetails[]> => {
  const rows = await db.any(`
    SELECT 
      q.question_id,
      q.question_text,
      q.scenario_id,
      q.question_difficulty_id,
      qd.question_difficulty_name,
      o.option_id,
      o.option_text,
      o.points
    FROM questions q
    JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    LEFT JOIN options o ON q.question_id = o.question_id
    ORDER BY q.question_id, o.option_id;
  `);

  const questionMap = new Map<number, QuestionWithDetails>();
  for (const row of rows) {
    if (!questionMap.has(row.question_id)) {
      questionMap.set(row.question_id, {
        question_id: row.question_id,
        question_text: row.question_text,
        scenario_id: row.scenario_id,
        question_difficulty_id: row.question_difficulty_id,
        question_difficulty_name: row.question_difficulty_name,
        options: [], 
      });
    }
    if (row.option_id) { 
      const questionEntry = questionMap.get(row.question_id);
      if (questionEntry) { 
        questionEntry.options.push({
          option_id: row.option_id,
          question_id: row.question_id, 
          option_text: row.option_text,
          points: row.points,
        } as GlobalOption); 
      }
    }
  }
  return Array.from(questionMap.values());
};

export const findById = async (questionId: number): Promise<QuestionWithDetails | null> => {
    const rows = await db.any(`
    SELECT 
      q.question_id,
      q.question_text,
      q.scenario_id,
      q.question_difficulty_id,
      qd.question_difficulty_name,
      o.option_id,
      o.option_text,
      o.points
    FROM questions q
    JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
    LEFT JOIN options o ON q.question_id = o.question_id
    WHERE q.question_id = $1
    ORDER BY o.option_id;
  `, [questionId]);

  if (rows.length === 0) {
    return null;
  }

  const question: QuestionWithDetails = {
    question_id: rows[0].question_id,
    question_text: rows[0].question_text,
    scenario_id: rows[0].scenario_id,
    question_difficulty_id: rows[0].question_difficulty_id,
    question_difficulty_name: rows[0].question_difficulty_name,
    options: [],
  };

  for (const row of rows) {
    if (row.option_id) {
      question.options.push({
        option_id: row.option_id,
        question_id: row.question_id,
        option_text: row.option_text,
        points: row.points,
      } as GlobalOption);
    }
  }
  return question;
};

export const create = async (data: QuestionInputRepository): Promise<Question> => {
  return db.tx(async t => {
    const questionResult = await t.one<Omit<Question, 'options'>>(`
      INSERT INTO questions (question_text, scenario_id, question_difficulty_id)
      VALUES ($1, $2, $3)
      RETURNING question_id, question_text, scenario_id, question_difficulty_id;
    `, [data.question_text, data.scenario_id, data.question_difficulty_id]);

    const questionId = questionResult.question_id;
    const createdOptions: GlobalOption[] = [];

    if (data.options && data.options.length > 0) {
      const optionQueries = data.options.map(opt => {
        return t.one<GlobalOption>(`
          INSERT INTO options (question_id, option_text, points)
          VALUES ($1, $2, $3)
          RETURNING option_id, question_id, option_text, points; 
        `, [questionId, opt.option_text.trim(), opt.points]);
      });
      const insertedOptions = await t.batch(optionQueries);
      if (insertedOptions) { 
        createdOptions.push(...insertedOptions.filter(opt => opt != null) as GlobalOption[]);
      }
    }
    return { 
        ...questionResult, 
        options: createdOptions 
    } as Question; 
  });
};

export const update = async (questionId: number, data: QuestionInputRepository): Promise<Question | null> => {
  return db.tx(async t => {
    const updatedQuestionResult = await t.oneOrNone<Omit<Question, 'options'>>(`
      UPDATE questions
      SET question_text = $1,
          scenario_id = $2,
          question_difficulty_id = $3
      WHERE question_id = $4
      RETURNING question_id, question_text, scenario_id, question_difficulty_id;
    `, [data.question_text, data.scenario_id, data.question_difficulty_id, questionId]);

    if (!updatedQuestionResult) {
      return null;
    }

    await t.none(`DELETE FROM options WHERE question_id = $1;`, [questionId]);

    const updatedWithOptions: GlobalOption[] = [];
    if (data.options && data.options.length > 0) {
      const insertOptionsQueries = data.options.map(opt =>
        t.one<GlobalOption>(`
          INSERT INTO options (question_id, option_text, points)
          VALUES ($1, $2, $3)
          RETURNING option_id, question_id, option_text, points;
        `, [questionId, opt.option_text.trim(), opt.points])
      );
      const insertedOptions = await t.batch(insertOptionsQueries);
      if (insertedOptions) {
         updatedWithOptions.push(...insertedOptions.filter(opt => opt != null) as GlobalOption[]);
      }
    }
    return { 
        ...updatedQuestionResult, 
        options: updatedWithOptions 
    } as Question; 
  });
};

export const remove = async (questionId: number): Promise<number> => {
  return db.tx(async t => {
    await t.none('DELETE FROM options WHERE question_id = $1', [questionId]);
    const result = await t.result('DELETE FROM questions WHERE question_id = $1', [questionId]);
    return result.rowCount; 
  });
};
