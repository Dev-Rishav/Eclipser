CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- e.g., "CSE", "Web Dev"
);