export interface RawUserQuestionRow {
  user_id: number;
  name: string;
  surname: string;
  email: string;
  scenario_name: string;
  question_text: string;
  question_id: number;
  scenario_id: number;
  question_difficulty_id: number;
  option_id: number;
  option_text: string;
  points: number;
  timestamp: string;
  history_id: number;
}