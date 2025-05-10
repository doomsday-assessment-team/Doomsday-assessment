export interface Scenario {
    scenario_id: number;
    scenario_name: string;
    description?: string; // From original spec, not your schema
  }
  
  export interface Option {
    option_id: number;
    option_text: string;
    points: number; // Points are server-side only for calculation
  }
  
  export interface Question {
    question_id: number;
    question_text: string;
    question_difficulty_id: number;
    question_difficulty_name?: string; // If joined
    difficulty_time?: number;          // If joined
    scenario_id: number;
    options: Option[];
  }
  
  export interface SelectedOptionInput {
    question_id: number;
    option_id: number;
  }
  
  export interface QuizAttemptInput {
    scenario_id: number;
    selected_options: SelectedOptionInput[];
  }
  
  export interface QuizAttemptResult {
    history_id: number;
    user_id: number;
    timestamp: Date; // Or string if you format it
    total_score: number;
    scenario_id: number;
    scenario_name?: string; // If you fetch and add it
    result_title: string;
    result_feedback: string;
  }