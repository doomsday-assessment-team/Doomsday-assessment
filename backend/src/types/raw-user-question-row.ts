export interface RawUserQuestionRow {
  user_id: number;
  name: string;
  surname: string;
  scenario_name: string;
  scenario_id: number;
  question_text: string;
  question_id: number;
  difficulty_id: number;
  difficulty_name: string
  option_id: number;
  option_text: string;
  selected_option_id: number;
  points: number;
  timestamp: string;
  history_id: number;
}