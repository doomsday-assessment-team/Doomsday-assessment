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
  question_id: number;
  option_text: string;
  points: number;
}

export interface Role {
  role_id: number;
  role_name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface AssessmentHistory {
  history_id: number;
  feedback: string;
  timestamp: string;
  scenario_id: number;
  scenario_name: string;
  difficulty_id: number;
  difficulty_name: string;
  user_name: string;
  user_id: number;
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