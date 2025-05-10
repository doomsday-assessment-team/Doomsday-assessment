CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    google_subject VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    role_id INTEGER NOT NULL REFERENCES roles(role_id)
);

CREATE TABLE scenarios (
    scenario_id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(100) NOT NULL
);

CREATE TABLE question_difficulties (
    question_difficulty_id SERIAL PRIMARY KEY,
    question_difficulty_name VARCHAR(30) NOT NULL,
    time INTEGER NOT NULL
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    question_difficulty_id INTEGER REFERENCES question_difficulties(question_difficulty_id),
    scenario_id INTEGER REFERENCES scenarios(scenario_id),
    question_text VARCHAR(100) NOT NULL
);

CREATE TABLE options (
    option_id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(question_id),
    option_text VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL
);

CREATE TABLE history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE history_questions (
    history_question_id SERIAL PRIMARY KEY,
    history_id INTEGER REFERENCES history(history_id),
    option_id INTEGER REFERENCES options(option_id),
    question_id INTEGER REFERENCES questions(question_id)
);
