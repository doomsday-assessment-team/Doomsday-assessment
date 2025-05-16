export interface Scenario {
    scenario_id: number;
    scenario_name: string;
    description?: string;
  }
  
  export interface Options {
    option_id: number;
    option_text: string;
    points: number;
  }
  
  export interface Question {
    question_id: number;
    question_text: string;
    question_difficulty_id: number;
    question_difficulty_name?: string;
    difficulty_time?: number;
    scenario_id: number;
    options: Options[];
  }
  
  export interface SelectedOptionInput {
    question_id: number;
    question_text: string;
    option_id: number;
    option_text: string;
  }
  
  export interface QuizAttemptInput {
    scenario_id: number;
    selected_options: SelectedOptionInput[];
  }
  
  export interface QuizAttemptResult {
    history_id: number;
    user_id: number;
    timestamp: Date;
    total_score: number;
    scenario_id: number;
    scenario_name?: string;
    result_title: string;
    result_feedback: string;
  }
  
  export interface UpdateQuestionInput {
    question_id: number;
    question_text: string;
  }