CREATE TABLE user_badges (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INT REFERENCES badges(badge_id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);