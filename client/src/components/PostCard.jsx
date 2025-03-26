// PostCard.jsx
import React from 'react';
import styles from '../styles/PostCard.module.css';

const PostCard = ({ post }) => {
  return (
    <div className={`${styles.card} ${post.answered ? styles.answered : ''}`}>
      <div className={styles.header}>
        <span className={styles.topic}>#{post.topic}</span>
        <span className={styles.time}>{post.time}</span>
      </div>
      <div className={styles.content}>
        {post.content}
      </div>
      <div className={styles.footer}>
        <div className={styles.metrics}>
          <div className={styles.metricItem}>
            <span>▲</span>
            {post.votes}
          </div>
          <div className={styles.metricItem}>
            <span>💬</span>
            {post.answers}
          </div>
        </div>
        <button className={styles.answerButton}>
          Transmit Answer
        </button>
      </div>
    </div>
  );
};

export default PostCard;