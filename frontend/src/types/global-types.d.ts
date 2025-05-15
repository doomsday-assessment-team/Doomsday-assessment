
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