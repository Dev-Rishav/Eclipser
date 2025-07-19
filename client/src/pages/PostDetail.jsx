import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { fetchPost } from '../utility/fetchPost';
import { PostCard } from '../components/PostCard';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        setError('No post ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('📍 Loading post with ID:', postId);
        
        // Fetch the specific post
        const postData = await fetchPost(postId);
        console.log('📄 Post data received:', postData);
        setPost(postData);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eclipse-bg dark:bg-space-void text-eclipse-text-light dark:text-space-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-eclipse-bg dark:bg-space-void text-eclipse-text-light dark:text-space-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-eclipse-muted-light dark:text-space-muted mb-6">
              {error || 'The post you are looking for could not be found.'}
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="px-6 py-3 bg-stellar-blue text-white rounded-lg hover:bg-stellar-blue/90 transition-colors"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eclipse-bg dark:bg-space-void text-eclipse-text-light dark:text-space-text">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold text-eclipse-text-light dark:text-space-text">
            Post Details
          </h1>
        </motion.div>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-eclipse-surface dark:bg-space-darker rounded-xl border border-eclipse-border dark:border-space-gray overflow-hidden"
        >
          {/* Debug Info */}
          <div className="p-4 border-b border-eclipse-border dark:border-space-gray bg-blue-50 dark:bg-blue-900/20">
            <h3 className="text-sm font-mono text-blue-800 dark:text-blue-200">Debug Info:</h3>
            <p className="text-xs text-blue-600 dark:text-blue-300">Post ID: {postId}</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">Post Data: {post ? 'Loaded' : 'Not loaded'}</p>
            {post && (
              <>
                <p className="text-xs text-blue-600 dark:text-blue-300">Title: {post.title}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">Author: {post.author?.username || 'Unknown'}</p>
              </>
            )}
          </div>
          
          {/* Actual Post */}
          {post && <PostCard post={post} />}
        </motion.div>

        {/* Related Actions or Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="bg-eclipse-surface dark:bg-space-darker rounded-xl border border-eclipse-border dark:border-space-gray p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-eclipse-border dark:bg-space-gray rounded-lg">
                <div className="text-2xl font-bold text-stellar-blue">{post.likes?.length || 0}</div>
                <div className="text-sm text-eclipse-muted-light dark:text-space-muted">Likes</div>
              </div>
              <div className="text-center p-4 bg-eclipse-border dark:bg-space-gray rounded-lg">
                <div className="text-2xl font-bold text-stellar-green">{post.comments?.length || 0}</div>
                <div className="text-sm text-eclipse-muted-light dark:text-space-muted">Comments</div>
              </div>
              <div className="text-center p-4 bg-eclipse-border dark:bg-space-gray rounded-lg">
                <div className="text-2xl font-bold text-stellar-orange">{post.views || 0}</div>
                <div className="text-sm text-eclipse-muted-light dark:text-space-muted">Views</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;
