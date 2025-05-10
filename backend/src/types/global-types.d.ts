export interface Scenario {
  scenario_id: number;
  scenario_name: string;
}

export interface QuestionDifficulty {
  question_difficulty_id: number;
  question_difficulty_name: string;
  time: number;
}

export interface Question {
  question_id: number;
  question_difficulty_id: number;
  scenario_id: number;
  question_text: string;
  options: Option[];
}

export interface Option {
  option_id: number;
  option_text: string;
  points: number;
}