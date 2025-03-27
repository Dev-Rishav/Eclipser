import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import styles from '../styles/PostCard.module.css';

export const PostCard = ({ post }) => {
  const isUpdated = post.createdAt !== post.updatedAt;
  const timeAgo = formatDistanceToNow(new Date(isUpdated ? post.updatedAt : post.createdAt), {
    addSuffix: true,
  });

  return (
    <div className={`${styles.card} ${post.postType === 'query' ? styles.query : styles.announcement}`}>
      <div className={styles.header}>
        <div className={styles.tags}>
          {post.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
        <div className={styles.meta}>
          <span className={styles.postType}>{post.postType}</span>
          <span 
            className={styles.time} 
            title={`${isUpdated ? 'Updated' : 'Created'} at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {isUpdated ? `🔄 ${timeAgo}` : `⏳ ${timeAgo}`}
          </span>
        </div>
      </div>

      <h3 className={styles.title}>{post.title}</h3>
      
      <div className={styles.content}>
        {post.content}
        {post.attachments?.length > 0 && (
          <div className={styles.attachments}>
            {post.attachments.map((file, index) => (
              <a
                key={index}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attachment}
              >
                📎 {file.fileType.toUpperCase()} Attachment
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricIcon}>🌌</span>
            {post.views} Views
          </div>
          <div className={styles.metric}>
            <span className={styles.metricIcon}>🚀</span>
            {post.likes.length} Launches
          </div>
          <div className={styles.metric}>
            <span className={styles.metricIcon}>💫</span>
            {post.comments.length} Signals
          </div>
        </div>
        
        <button className={styles.actionButton}>
          {post.postType === 'query' ? 'Transmit Answer' : 'Engage Discussion'}
        </button>
      </div>
    </div>
  );
};