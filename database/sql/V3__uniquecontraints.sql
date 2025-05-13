ALTER TABLE user_roles
ADD CONSTRAINT unique_user_role UNIQUE (user_id, role_id);

ALTER TABLE scenarios
ADD CONSTRAINT unique_scenario_name UNIQUE (scenario_name);

ALTER TABLE question_difficulties
ADD CONSTRAINT unique_question_difficulty_name UNIQUE (question_difficulty_name);

ALTER TABLE questions
ADD CONSTRAINT unique_question_per_scenario UNIQUE (scenario_id, question_text);

ALTER TABLE options
ADD CONSTRAINT unique_option_per_question UNIQUE (question_id, option_text);

ALTER TABLE history_questions
ADD CONSTRAINT unique_history_answer UNIQUE (history_id, question_id);