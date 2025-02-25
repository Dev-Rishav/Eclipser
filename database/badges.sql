CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    criteria TEXT NOT NULL -- e.g., "Solve 50 problems"
);