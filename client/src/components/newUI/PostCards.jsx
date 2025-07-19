import { useState, useMemo, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PostCard } from "../PostCard";
import { createPost } from "../../utility/createPost";
import { toast } from "react-hot-toast";
import { HighlightSyntax } from "../HighlightSyntax";
import { AnimatedModal } from "../AnimateModal";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const PostCards = ({ 
  sortBy = 'newest', 
  filterBy = 'all',
  user
}) => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    postType: "query",
    tags: [],
    codeSnippet: "",
    language: "javascript",
  });

  // Use the new industry-standard infinite scroll hook
  const {
    posts,
    isLoading,
    isInitialLoad,
    hasNextPage,
    error,
    sentinelRef,
    addPost,
    refresh
  } = useInfiniteScroll(user, {
    pageSize: 15, // Larger page size for better performance
    threshold: 0.1,
    rootMargin: '200px', // Load earlier for smoother experience
    retryAttempts: 3,
    enableCache: true
  });

  // Reset scroll to top on initial load to fix the scroll position issue
  useEffect(() => {
    if (isInitialLoad && posts.length === 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isInitialLoad, posts.length]);

  // Filter and sort posts - Optimized with better memoization
  const filteredAndSortedPosts = useMemo(() => {
    console.log('🔄 Processing posts for display:', posts.length);
    
    // Early return if no posts
    if (!posts || posts.length === 0) {
      return [];
    }

    let filtered = [...posts];

    // Apply filtering
    if (filterBy !== 'all') {
      filtered = filtered.filter(post => {
        switch (filterBy) {
          case 'questions':
          case 'query':
            return post.postType === 'query' || post.postType === 'question';
          case 'solutions':
            return post.postType === 'solution' || post.postType === 'answer';
          case 'snippets':
            return post.postType === 'snippet' || post.codeSnippet;
          case 'discussion':
            return post.postType === 'discussion';
          case 'achievement':
            return post.postType === 'achievement';
          default:
            return true;
        }
      });
    }

    // Apply sorting with stable sort
    const sortedPosts = [...filtered].sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'oldest':
          return aDate - bDate;
        case 'popular': {
          const aScore = (a.likes?.length || 0) + (a.comments?.length || 0);
          const bScore = (b.likes?.length || 0) + (b.comments?.length || 0);
          return bScore - aScore || bDate - aDate; // Secondary sort by date
        }
        case 'trending': {
          const now = Date.now();
          const aScore = (a.likes?.length || 0) * 2 + (a.comments?.length || 0);
          const bScore = (b.likes?.length || 0) * 2 + (b.comments?.length || 0);
          const aAge = (now - aDate.getTime()) / (1000 * 60 * 60 * 24); // Days
          const bAge = (now - bDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // Trending score: engagement divided by age + 1
          const aTrending = aScore / (aAge + 1);
          const bTrending = bScore / (bAge + 1);
          
          return bTrending - aTrending;
        }
        case 'newest':
        default:
          return bDate - aDate;
      }
    });

    console.log('✅ Processed posts:', {
      original: posts.length,
      filtered: filtered.length,
      final: sortedPosts.length,
      sortBy,
      filterBy
    });

    return sortedPosts;
  }, [posts, sortBy, filterBy]);

  const handleCreatePost = async () => {
    try {
      const createdPost = await createPost(newPost);
      
      // Add to the beginning of the posts list
      addPost(createdPost);
      
      // Reset form
      setIsCreatingPost(false);
      setNewPost({
        title: "",
        content: "",
        postType: "query",
        tags: [],
        codeSnippet: "",
        language: "javascript",
      });
      
      toast.success("Post created successfully!");
      
      // Don't refresh the page - just add the post
      console.log('📝 Post created and added to feed');
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Failed to load posts
          </h3>
          <p className="text-red-300 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Feed Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-10 bg-space-dark/90 backdrop-blur-lg pb-2"
      >
        {/* Control bar content can be added here */}
      </motion.div>

      {/* Initial Loading State */}
      {isInitialLoad && isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-blue mx-auto mb-4"></div>
            <div className="text-stellar-blue text-lg font-mono">
              Summoning cosmic feed...
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Posts Feed - Optimized rendering without animations to prevent scroll jumping */}
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <div key={`post-${post._id}`} className="w-full">
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {/* No Posts Message */}
          {filteredAndSortedPosts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌌</div>
              <h3 className="text-xl font-semibold text-stellar-blue mb-2">
                No posts in this cosmic sector
              </h3>
              <p className="text-space-muted">
                {filterBy !== 'all' 
                  ? `No ${filterBy} posts found. Try changing your filter.`
                  : 'Be the first to share something with the universe!'
                }
              </p>
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          {hasNextPage && filteredAndSortedPosts.length > 0 && (
            <div 
              ref={sentinelRef}
              className="flex items-center justify-center py-8"
            >
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-blue/40 mx-auto mb-2"></div>
                  <span className="text-sm font-mono text-stellar-blue/60">
                    Loading more transmissions...
                  </span>
                </div>
              ) : (
                <div className="text-sm text-space-muted">
                  Scroll to load more
                </div>
              )}
            </div>
          )}

          {/* End of Feed */}
          {!hasNextPage && filteredAndSortedPosts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-2">🌟</div>
              <p className="text-stellar-blue font-semibold">
                All transmissions eclipsed. Await the next cosmic alignment!
              </p>
              <button
                onClick={refresh}
                className="mt-4 px-4 py-2 bg-stellar-blue/20 border border-stellar-blue/30 rounded-lg text-stellar-blue hover:bg-stellar-blue/30 transition-colors"
              >
                Refresh Feed
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      <AnimatedModal
        isOpen={isCreatingPost}
        onClose={() => setIsCreatingPost(false)}
      >
        <div className="bg-space-dark rounded-lg p-6 max-w-2xl mx-4 border border-stellar-blue shadow-stellar-blue-glow">
          <h2 className="text-xl font-bold text-space-text mb-4">New Transmission</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Transmission Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full p-3 bg-space-void border border-stellar-blue/30 rounded-lg text-space-text placeholder-space-muted focus:outline-none focus:border-stellar-blue focus:shadow-stellar-blue-glow"
            />

            <textarea
              placeholder="Your cosmic message..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full p-3 bg-space-void border border-stellar-blue/30 rounded-lg text-space-text placeholder-space-muted focus:outline-none focus:border-stellar-blue focus:shadow-stellar-blue-glow h-32 resize-none"
            />

            <div className="flex space-x-4">
              <select
                value={newPost.postType}
                onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}
                className="p-3 bg-space-void border border-stellar-blue/30 rounded-lg text-space-text focus:outline-none focus:border-stellar-blue"
              >
                <option value="query">Query</option>
                <option value="discussion">Discussion</option>
                <option value="achievement">Achievement</option>
              </select>

              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newPost.tags.join(", ")}
                onChange={(e) => setNewPost({ 
                  ...newPost, 
                  tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) 
                })}
                className="flex-1 p-3 bg-space-void border border-stellar-blue/30 rounded-lg text-space-text placeholder-space-muted focus:outline-none focus:border-stellar-blue"
              />
            </div>

            {newPost.codeSnippet && (
              <div className="space-y-2">
                <select
                  value={newPost.language}
                  onChange={(e) => setNewPost({ ...newPost, language: e.target.value })}
                  className="p-3 bg-space-void border border-stellar-blue/30 rounded-lg text-space-text focus:outline-none focus:border-stellar-blue"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="typescript">TypeScript</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                </select>

                <HighlightSyntax
                  language={newPost.language}
                  value={newPost.codeSnippet}
                  onChange={(value) => setNewPost({ ...newPost, codeSnippet: value })}
                  className="rounded-lg border border-stellar-blue/30"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setNewPost({ 
                  ...newPost, 
                  codeSnippet: newPost.codeSnippet ? "" : "// Add your code here" 
                })}
                className="px-4 py-2 bg-stellar-orange/20 border border-stellar-orange/30 rounded-lg text-stellar-orange hover:bg-stellar-orange/30 transition-colors"
              >
                {newPost.codeSnippet ? "Remove Code" : "Add Code Snippet"}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreatingPost(false)}
                  className="px-6 py-2 bg-space-dark border border-stellar-orange/30 text-stellar-orange rounded-lg hover:border-stellar-orange transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="px-6 py-2 bg-stellar-blue hover:bg-stellar-blue/80 disabled:bg-stellar-blue/30 disabled:cursor-not-allowed text-white rounded-lg shadow-stellar-blue-glow transition-colors"
                >
                  Transmit to Cosmos
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default memo(PostCards);