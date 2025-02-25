CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    score INT CHECK (score BETWEEN 0 AND 100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);