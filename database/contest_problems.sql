CREATE TABLE contest_problems (
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    PRIMARY KEY (contest_id, problem_id)
);