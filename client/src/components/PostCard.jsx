import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  FaEye,
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane,
} from "react-icons/fa";
import { likePost } from "../utility/likePost.js";
import { toast } from "react-hot-toast";
import { createComment } from "../utility/createComment.js";
import { fetchUsersByIds } from "../utility/fetchUsersByIds.js";
import { useNavigate } from "react-router-dom";
import { sseManager } from "../config/sseConfig.js";

export const PostCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length || 0);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [enrichedComments, setEnrichedComments] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });
  const [user] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const navigate = useNavigate();

  const MAX_VISIBLE_TAGS = 2;
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagsCount = post.tags.length - MAX_VISIBLE_TAGS;

  useEffect(() => {
    const fetchCommentsWithUsers = async () => {
      try {
        const userIds = [
          ...new Set(post.comments.map((comment) => comment.userId)),
        ];

        const users = await fetchUsersByIds(userIds);

        const commentsWithUsers = post.comments.map((comment) => {
          const user = users.find((u) => u._id === comment.userId);
          return {
            author: {
              userId: comment.userId,
              username: user?.username || "Unknown User",
              profilePic: user?.profilePic || null,
            },
            postId: post._id,
            content: comment.content,
            dateTime: comment.timestamp,
          };
        });

        setEnrichedComments(commentsWithUsers);
      } catch (error) {
        console.error(
          "Failed to fetch comments with user details:",
          error.message
        );
      }
    };

    fetchCommentsWithUsers();
  }, [post]);

  useEffect(() => {
    const checkLikeStatus = () => {
      if (post.likes?.length > 0) {
        const liked = post.likes.find((like) => like.userId === user?._id);
        if (liked) setIsLiked(true);
      }
    };
    checkLikeStatus();
  }, [post.likes, user]);

  const handleLike = () => {
    if (isLiked) {
      toast.error("You've already liked this post!");
      return;
    }
    likePost(post);
    setIsLiked(!isLiked);
  };

  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      const newComment = await createComment(post._id, newCommentContent);
      setEnrichedComments([...enrichedComments, newComment]);
      setNewCommentContent("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error("Comment error:", error);
    }
  };

  useEffect(() => {
    // Connect to SSE stream if not already connected
    if (!sseManager.isConnected) {
      sseManager.connect('/stream');
    }

    // Handler for like events
    const handleLikeEvent = (data) => {
      if (data.type === "like" && data.postId === post._id) {
        const alreadyLiked = post.likes.some(
          (like) => like.userId === data.userId
        );
        if (!alreadyLiked) {
          const userPayload = {
            userId: data.userId,
            username: data.username,
            profilePic: data.profilePic,
            dateTime: data.dateTime,
          };
          post.likes.push(userPayload);
          const updatedLikes = [...post.likes];

          setPost((prevPost) => ({ ...prevPost, likes: updatedLikes }));
          setLikesCount(updatedLikes.length);

          if (data.userId === user._id) {
            setIsLiked(true);
            toast.success("Post liked successfully!");
          }
        }
      }
    };

    // Handler for comment events
    const handleCommentEvent = (data) => {
      if (data.type === "comment" && data.postId === post._id) {
        setEnrichedComments((prev) => [
          ...prev,
          {
            author: {
              userId: data.author.userId,
              username: data.author.username,
              profilePic: data.author.profilePic,
            },
            postId: data.postId,
            content: data.content,
            dateTime: data.dateTime,
          },
        ]);
      }
    };

    // Combined message handler
    const handleMessage = (data) => {
      handleLikeEvent(data);
      handleCommentEvent(data);
    };

    // Add event listener for this post
    sseManager.addEventListener('message', handleMessage);

    // Cleanup function
    return () => {
      sseManager.removeEventListener('message', handleMessage);
    };
  }, [post._id, user._id, post.likes, post.comments]);

  return (
    <motion.div
      className={`relative p-6 mb-6 rounded-xl border-2 transition-all duration-300 group ${
        post.postType === "query"
          ? "bg-gradient-to-br from-stellar-blue/10 via-eclipse-surface to-stellar-blue/5 dark:from-stellar-blue/15 dark:via-space-dark dark:to-stellar-blue/10 border-stellar-blue/30 hover:border-stellar-blue/60 hover:shadow-stellar-blue-glow"
          : "bg-gradient-to-br from-stellar-orange/10 via-eclipse-surface to-stellar-orange/5 dark:from-stellar-orange/15 dark:via-space-dark dark:to-stellar-orange/10 border-stellar-orange/30 hover:border-stellar-orange/60 hover:shadow-stellar-orange-glow"
      } shadow-lg hover:shadow-2xl backdrop-blur-sm`}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-eclipse-border/20 dark:hover:bg-space-light/20 p-2 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/profile", { state: { userId: post.author.userId } });
          }}
        >
          {post.author?.profilePic ? (
            <img
              src={post.author.profilePic}
              alt={post.author.username}
              className="w-10 h-10 rounded-full border-2 border-stellar-blue/50 object-cover shadow-stellar-blue-glow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stellar-blue flex items-center justify-center shadow-stellar-blue-glow">
              <span className="text-sm font-bold text-white">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-eclipse-text-light dark:text-space-text">
              {post.author?.username || 'Unknown'}
            </h4>
            <p className="text-xs text-eclipse-muted-light dark:text-space-muted font-mono">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Post Type Badge */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${
              post.postType === "query" ? "bg-stellar-blue" : "bg-stellar-orange"
            } shadow-lg`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              post.postType === "query"
                ? "text-stellar-blue bg-stellar-blue/10 border border-stellar-blue/30"
                : "text-stellar-orange bg-stellar-orange/10 border border-stellar-orange/30"
            }`}
          >
            {post.postType === "query" ? "QUERY" : "DISCUSSION"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="mb-4 cursor-pointer"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        <h3 className="text-xl font-bold text-eclipse-text-light dark:text-space-text mb-3 group-hover:text-stellar-blue dark:group-hover:text-stellar-blue transition-colors leading-tight">
          {post.title}
        </h3>
        
        <div className="text-eclipse-text-light dark:text-space-text leading-relaxed">
          {showFullContent ? (
            <div className="space-y-3">
              {post.content.split("\n").map((paragraph, index) => (
                <p key={index} className="text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm">
              {post.content.length > 200 
                ? `${post.content.substring(0, 200)}...`
                : post.content
              }
            </p>
          )}
          
          {post.content.length > 200 && (
            <button
              className="text-stellar-blue hover:text-stellar-orange transition-colors text-sm font-medium mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(!showFullContent);
              }}
            >
              {showFullContent ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-eclipse-border/30 dark:bg-space-darker text-stellar-blue/80 dark:text-stellar-blue border border-stellar-blue/20 hover:bg-stellar-blue/10 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="px-3 py-1 text-xs text-eclipse-muted-light dark:text-space-muted">
              +{hiddenTagsCount} more
            </span>
          )}
        </div>
      )}

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-eclipse-border/30 dark:border-space-gray/30">
        {/* Left Actions */}
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <motion.button
            className="flex items-center gap-2 text-eclipse-muted-light dark:text-space-muted hover:text-stellar-orange transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLiked ? (
              <FaHeart className="w-5 h-5 text-stellar-orange" />
            ) : (
              <FaRegHeart className="w-5 h-5" />
            )}
            <span className="text-sm font-mono">{likesCount}</span>
          </motion.button>

          {/* Comment Button */}
          <motion.button
            className={`flex items-center gap-2 transition-colors ${
              showComments 
                ? 'text-stellar-green' 
                : 'text-eclipse-muted-light dark:text-space-muted hover:text-stellar-green'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaCommentDots className={`w-5 h-5 ${showComments ? 'text-stellar-green' : ''}`} />
            <span className="text-sm font-mono">{enrichedComments.length}</span>
            <span className="text-xs">
              {showComments ? 'Hide' : 'Comment'}
            </span>
          </motion.button>

          {/* Views */}
          <div className="flex items-center gap-2 text-eclipse-muted-light dark:text-space-muted">
            <FaEye className="w-5 h-5" />
            <span className="text-sm font-mono">{post.views}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Bookmark Button */}
          <motion.button
            className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
              toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isBookmarked ? (
              <FaBookmark className="w-5 h-5 text-stellar-blue" />
            ) : (
              <FaRegBookmark className="w-5 h-5" />
            )}
          </motion.button>

          {/* Share Button */}
          <motion.button
            className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-purple transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
              toast.success("Link copied to clipboard!");
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShare className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <motion.div
        initial={false}
        animate={{ height: showComments ? "auto" : 0, opacity: showComments ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {showComments && (
          <div className="pt-4 border-t border-eclipse-border/20 dark:border-space-gray/20 mt-4">
            {/* Comment Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-eclipse-text-light dark:text-space-text">
                Comments ({enrichedComments.length})
              </h4>
              <motion.button
                className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-orange transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(false);
                }}
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleNewCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-stellar-blue/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stellar-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 rounded-lg bg-eclipse-border/30 dark:bg-space-darker border border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text focus:outline-none focus:border-stellar-blue focus:shadow-stellar-blue-glow placeholder-eclipse-muted-light dark:placeholder-space-muted transition-colors"
                  />
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-stellar-blue hover:bg-stellar-green rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newCommentContent.trim()}
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    <span className="text-sm">Post</span>
                  </motion.button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
              {enrichedComments.map((comment, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-eclipse-border/20 dark:hover:bg-space-light/10 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {comment.author.profilePic ? (
                    <img
                      src={comment.author.profilePic}
                      alt={comment.author.username}
                      className="w-7 h-7 rounded-full object-cover border border-stellar-blue/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stellar-blue flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white">
                        {comment.author.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="bg-eclipse-border/30 dark:bg-space-darker rounded-lg px-3 py-2 border border-eclipse-border/20 dark:border-space-gray/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-eclipse-text-light dark:text-space-text">
                          {comment.author.username}
                        </span>
                        <span className="text-xs text-eclipse-muted-light dark:text-space-muted">
                          {comment.dateTime
                            ? formatDistanceToNow(new Date(comment.dateTime), { addSuffix: true })
                            : 'now'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-eclipse-text-light dark:text-space-text leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {enrichedComments.length === 0 && (
                <motion.div 
                  className="text-center py-8 text-eclipse-muted-light dark:text-space-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaCommentDots className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">No comments yet</p>
                  <p className="text-xs">Be the first to share your thoughts!</p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Cockpit Glow Effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
        post.postType === "query"
          ? "bg-gradient-to-r from-stellar-blue/5 via-transparent to-stellar-blue/5"
          : "bg-gradient-to-r from-stellar-orange/5 via-transparent to-stellar-orange/5"
      }`} />

    </motion.div>
  );
};
