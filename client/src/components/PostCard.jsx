import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export const PostCard = ({ post }) => {
  const isUpdated = post.createdAt !== post.updatedAt;
  const timeAgo = formatDistanceToNow(new Date(isUpdated ? post.updatedAt : post.createdAt), {
    addSuffix: true,
  });

  return (
    <div className={`p-4 mb-4 rounded-xl border ${
      post.postType === 'query' 
        ? 'border-l-4 border-purple-500' 
        : 'border-l-4 border-orange-500'
    } bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg hover:transform hover:-translate-y-1 transition-all`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 text-sm font-medium rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
            post.postType === 'query'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {post.postType.toUpperCase()}
          </span>
          <span 
            className="text-sm text-gray-400"
            title={`${isUpdated ? 'Updated' : 'Created'} at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {isUpdated ? '🔄' : '⏳'} {timeAgo}
          </span>
        </div>
      </div>

      {/* Title & Content */}
      <h3 className="mb-2 text-xl font-orbitron text-amber-400">{post.title}</h3>
      <p className="mb-4 text-gray-300 leading-relaxed">{post.content}</p>

      {/* Attachments */}
      {post.attachments?.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {post.attachments.map((file, index) => (
            <a
              key={index}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-400 hover:text-orange-400 transition-colors"
            >
              <span className="mr-2">📎</span>
              <span className="text-sm">{file.fileType.toUpperCase()} Attachment</span>
            </a>
          ))}
        </div>
      )}

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <span>🌌</span>
            <span className="text-sm">{post.views} Views</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚀</span>
            <span className="text-sm">{post.likes.length} Launches</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💫</span>
            <span className="text-sm">{post.comments.length} Signals</span>
          </div>
        </div>

        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg font-semibold text-gray-900 hover:brightness-110 transition-all w-full sm:w-auto text-center">
          {post.postType === 'query' ? 'Transmit Answer' : 'Engage Discussion'}
        </button>
      </div>
    </div>
  );
};

// export default PostCard;


