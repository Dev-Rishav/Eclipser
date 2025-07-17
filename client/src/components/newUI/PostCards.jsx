import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { usePostLoader } from "../../hooks/usePostLoader";
import { PostCard } from "../PostCard";
import FeedControlBar from "../FeedControlBar";
import { createPost } from "../../utility/createPost";
import { toast } from "react-hot-toast";
import { HighlightSyntax } from "../HighlightSyntax";
import { AnimatedModal } from "../AnimateModal";

const PostCards = ({ sortBy = 'newest', filterBy = 'all' }) => {
  const user = useSelector((state) => state.auth.user);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    postType: "query",
    tags: [],
    codeSnippet: "",
    language: "javascript",
  });

  const {
    posts,
    setPosts,
    isLoading,
    lastPostRef,
    allPostsExhausted,
    livePosts,
    setLivePosts,
  } = usePostLoader(user);

  // Filter and sort posts based on props
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply filtering
    if (filterBy !== 'all') {
      filtered = filtered.filter(post => {
        switch (filterBy) {
          case 'questions':
            return post.postType === 'query' || post.postType === 'question';
          case 'solutions':
            return post.postType === 'solution' || post.postType === 'answer';
          case 'snippets':
            return post.postType === 'snippet' || post.codeSnippet;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'popular': {
          const aLikes = (a.likes?.length || 0) + (a.comments?.length || 0);
          const bLikes = (b.likes?.length || 0) + (b.comments?.length || 0);
          return bLikes - aLikes;
        }
        case 'trending': {
          const aScore = (a.likes?.length || 0) * 2 + (a.comments?.length || 0);
          const bScore = (b.likes?.length || 0) * 2 + (b.comments?.length || 0);
          const aRecency = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const bRecency = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return (bScore / (bRecency + 1)) - (aScore / (aRecency + 1));
        }
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [posts, sortBy, filterBy]);

  const handleCreatePost = async () => {
    try {
      const createdPost = await createPost(newPost);
      setPosts([createdPost, ...posts]);
      localStorage.setItem(
        "cachedPosts",
        JSON.stringify([createdPost, ...posts])
      );
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
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Feed Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-10 bg-space-dark/90 backdrop-blur-lg pb-2"
      >
        {/* <FeedControlBar
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        /> */}
      </motion.div>

      {/* Create Post Button */}
      {/* <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreatingPost(true)}
        className="w-full p-4 bg-cyber-dark border border-cyber-blue/30 rounded-lg text-cyber-text hover:border-cyber-blue hover:shadow-cyber-blue-glow transition-all"
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-cyber-blue">✨</span>
          <span>Start New Transmission</span>
        </div>
      </motion.button> */}

      {/* Live Posts Indicator */}
      {livePosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-stellar-orange/20 border border-stellar-orange text-stellar-orange p-3 rounded-lg cursor-pointer hover:bg-stellar-orange/30 transition-all"
          onClick={() => {
            setPosts((prev) => [...livePosts, ...prev]);
            localStorage.setItem(
              "cachedPosts",
              JSON.stringify([...livePosts, ...posts])
            );
            setLivePosts([]);
          }}
        >
          🔔 {livePosts.length} new transmission(s) available. Click to load!
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center text-stellar-blue mt-4 text-lg font-mono">
          <div className="animate-stellar-pulse">Summoning cosmic feed...</div>
        </div>
      ) : (
        <>
          {/* No Topics Message */}
          {/* {(user?.subscribedTopics || []).length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-purple/30 text-center"
            >
              <span className="text-lg font-mono text-cyber-purple mb-2 inline-block">
                🌌 No Celestial Tags Locked In
              </span>
              <p className="text-cyber-text/60 text-sm">
                Catching stardust from across the universe...
                <span className="ml-2 animate-cyber-pulse">✨</span>
              </p>
            </motion.div>
          )} */}

          {/* Posts */}
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post, index) => {
              const isLast = index === filteredAndSortedPosts.length - 1;
              return (
                <motion.div 
                  key={post._id} 
                  ref={isLast ? lastPostRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              );
            })}
          </div>

          {/* End of Posts */}
          {allPostsExhausted && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-stellar-blue font-bold mt-4"
            >
              All transmissions eclipsed. Await the next cosmic alignment!
            </motion.p>
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
                  className="px-6 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-white rounded-lg shadow-stellar-blue-glow transition-colors"
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

export default PostCards;