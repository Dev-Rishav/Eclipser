CREATE TABLE user_interests (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id INT REFERENCES interests(interest_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);