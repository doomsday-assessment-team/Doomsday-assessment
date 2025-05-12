CREATE OR REPLACE VIEW user_question_points AS
SELECT
    u.user_id,
    u.name,
    u.surname,
    u.email,
    s.scenario_id,
    s.scenario_name,
    qd.question_difficulty_id,
    qd.question_difficulty_name,
    q.question_id,
    q.question_text,
    o.points AS selected_option_points,
    h.timestamp
FROM history_questions hq
JOIN history h ON hq.history_id = h.history_id
JOIN users u ON h.user_id = u.user_id
JOIN options o ON hq.option_id = o.option_id
JOIN questions q ON hq.question_id = q.question_id
JOIN question_difficulties qd ON q.question_difficulty_id = qd.question_difficulty_id
JOIN scenarios s ON q.scenario_id = s.scenario_id;