
interface Option {
  option_id: number;
  option_text: string;
  points: number;
}

export interface Scenario {
    scenario_id: number;
    scenario_name: string;
}

export interface Difficulty {
    question_difficulty_id: number;
    question_difficulty_name: string;
    time: number;
}

export interface Role {
  role_id: number,
  role_name: string
}

interface AssessmentHistory {
  history_id: number;
  feedback: string;
  timestamp: string;
  scenario_id: number;
  scenario_name: string;
  difficulty_id: number;
  difficulty_name: string;
  questions: {
    question_id: number;
    question_text: string;
    selected_option_id: number;
    options: {
      option_id: number;
      option_text: string;
      points: number;
    }[];
  }[];
}

interface AssessmentSummaryRow {
  history_id: number;
  timestamp: string;
  scenario_id: number;
  scenario_name: string;
  question_difficulty_id: number;
  question_difficulty_name: string;
  total_points: string;
}