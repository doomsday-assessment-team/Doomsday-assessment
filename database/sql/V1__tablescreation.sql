CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    role_id INT REFERENCES role(role_id),
    name VARCHAR(50) NOT NULL,
    google_subject VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE scenario (
    scenario_id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(100) NOT NULL
);

CREATE TABLE question_difficulty (
    question_difficulty_id SERIAL PRIMARY KEY,
    question_difficulty_name VARCHAR(30) NOT NULL,
    time INT NOT NULL
);

CREATE TABLE question (
    question_id SERIAL PRIMARY KEY,
    question_difficulty_id INT REFERENCES question_difficulty(question_difficulty_id),
    scenario_id INT REFERENCES scenario(scenario_id),
    question_text TEXT NOT NULL
);

CREATE TABLE option (
    option_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES question(question_id),
    option_text TEXT NOT NULL,
    points INT NOT NULL
);

CREATE TABLE history (
    history_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "user"(user_id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE history_question (
    history_id INT REFERENCES history(history_id),
    option_id INT REFERENCES option(option_id),
    question_id INT REFERENCES question(question_id),
    PRIMARY KEY (history_id, option_id)
);
