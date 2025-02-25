CREATE TABLE contests (
    contest_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);