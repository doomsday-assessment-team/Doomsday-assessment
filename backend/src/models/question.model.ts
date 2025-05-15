// models/question.model.ts
import db from '../config/db';

interface OptionInput {
  option_text: string;
  points: number;
}

interface QuestionInput {
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: OptionInput[];
}

export const findAllQuestions = async () => {
  const rows = await db.any(`
    SELECT 
      q.question_id,
      q.question_text,
      q.scenario_id,
      q.question_difficulty_id,
      d.question_difficulty_name,
      o.option_id,
      o.option_text,
      o.points
    FROM questions q
    JOIN question_difficulties d ON q.question_difficulty_id = d.question_difficulty_id
    LEFT JOIN options o ON q.question_id = o.question_id
    ORDER BY q.question_id, o.option_id;
  `);

  return mapRowsToQuestions(rows);
};

const mapRowsToQuestions = (rows: any[]) => {
  const questionMap = new Map<number, any>();

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

    if (row.option_id !== null) {
      questionMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text,
        points: row.points,
      });
    }
  }

  return Array.from(questionMap.values());
};

export const addQuestion = async (question: QuestionInput): Promise<number> => {
  return db.tx(async t => {
    const inserted = await t.one(`
      INSERT INTO questions (question_text, scenario_id, question_difficulty_id)
      VALUES ($1, $2, $3)
      RETURNING question_id;
    `, [question.question_text, question.scenario_id, question.question_difficulty_id]);

    const questionId = inserted.question_id;
    const optionTexts = question.options.map(o => o.option_text.trim());
    const duplicates = optionTexts.filter((text, index) => optionTexts.indexOf(text) !== index);

    if (duplicates.length > 0) {
    throw new Error(`Duplicate option_text values: ${duplicates.join(', ')}`);
    }

    const uniqueOptions = Array.from(
      new Map(
        question.options.map(opt => [opt.option_text.trim(), opt])
      ).values()
    );

    const optionQueries = uniqueOptions.map(opt =>
      t.none(`
        INSERT INTO options (question_id, option_text, points)
        VALUES ($1, $2, $3);
      `, [questionId, opt.option_text.trim(), opt.points])
    );

    await t.batch(optionQueries);
    return questionId;
  });
};

export const updateQuestion = async (
  questionId: number,
  data: {
    question_text: string;
    options: OptionInput[];
  }
) => {
  return db.tx(async t => {
    await t.none(`
      UPDATE questions
      SET question_text = $1
      WHERE question_id = $2;
    `, [data.question_text, questionId]);

    await t.none(`DELETE FROM options WHERE question_id = $1;`, [questionId]);

    const optionTexts = data.options.map(o => o.option_text.trim());
    const duplicates = optionTexts.filter((text, index) => optionTexts.indexOf(text) !== index);

    if (duplicates.length > 0) {
    throw new Error(`Duplicate option_text values in update: ${duplicates.join(', ')}`);
    }

    const uniqueOptions = Array.from(
      new Map(
        data.options.map(opt => [opt.option_text.trim(), opt])
      ).values()
    );

    const insertOptions = uniqueOptions.map(opt =>
      t.none(`
        INSERT INTO options (question_id, option_text, points)
        VALUES ($1, $2, $3);
      `, [questionId, opt.option_text.trim(), opt.points])
    );

    await t.batch(insertOptions);
  });
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  return db.tx(async t => {
    await t.none(`DELETE FROM options WHERE question_id = $1;`, [questionId]);
    await t.none(`DELETE FROM questions WHERE question_id = $1;`, [questionId]);
  });
};
