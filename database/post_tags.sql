CREATE TABLE post_tags (
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);