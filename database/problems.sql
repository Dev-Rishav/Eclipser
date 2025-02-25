
CREATE TABLE problems (
    problem_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    test_cases JSONB NOT NULL -- Input/output pairs
);