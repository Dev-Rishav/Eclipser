import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FaEye,
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaPaperclip,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { likePost } from "../utility/likePost.js";
import { toast } from "react-hot-toast";
import { createComment } from "../utility/createComment.js";
import { fetchUsersByIds } from "../utility/fetchUsersByIds.js";
import { CodeHighlighter } from "./CodeHighlighter.jsx";
import { useNavigate } from "react-router-dom";
import { sseManager } from "../config/sseConfig.js";

export const PostCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length || 0);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [enrichedComments, setEnrichedComments] = useState([]);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });
  const [user] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const MAX_VISIBLE_TAGS = 2;
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagsCount = post.tags.length - MAX_VISIBLE_TAGS;

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [setIsLoading, showComments]);

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
    <div
      className={`p-6 mb-4 rounded-lg border bg-eclipse-surface dark:bg-space-dark shadow-space-card transition-all hover:shadow-space-elevated ${
        post.postType === "query"
          ? "border-l-4 border-stellar-blue"
          : "border-l-4 border-stellar-orange"
      } border-eclipse-border dark:border-space-gray`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium rounded-full bg-eclipse-border/50 dark:bg-space-darker text-stellar-blue border border-stellar-blue/50 shadow-stellar-blue-glow animate-edge-glow"
            >
              #{tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="px-3 py-1 text-sm text-eclipse-muted-light dark:text-space-muted">
              +{hiddenTagsCount} more
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded text-xs font-bold font-mono animate-edge-glow ${
              post.postType === "query"
                ? "bg-eclipse-border/50 dark:bg-space-darker text-stellar-blue border border-stellar-blue/50 shadow-stellar-blue-glow"
                : "bg-eclipse-border/50 dark:bg-space-darker text-stellar-orange border border-stellar-orange/50 shadow-stellar-orange-glow"
            }`}
          >
            {post.postType.toUpperCase()}
          </span>
          <span
            className="text-sm text-eclipse-muted-light dark:text-space-muted font-mono"
            title={`Created at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Author Section */}
      <div
        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-eclipse-border/20 dark:hover:bg-space-light/20 p-2 rounded-lg transition-colors"
        onClick={() => navigate("/profile", {
          state: { userId: post.author.userId }
        })}
        title={`View ${post.author?.username || "Unknown User"}'s profile`}
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
              {post.author?.username[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-base font-semibold text-eclipse-text-light dark:text-space-text">
            {post.author?.username}
          </span>
          {post.author?.role && (
            <span className="text-xs text-stellar-blue font-medium font-mono">
              {post.author.role}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-xl font-bold text-eclipse-text-light dark:text-space-text">
          {post.title}
        </h3>

        <div className="space-y-4 text-eclipse-text-light dark:text-space-text leading-relaxed">
          {post.content.split("\n```").map((section, index) => {
            if (index % 2 === 1) {
              const [language, ...codeLines] = section.split("\n");
              const code = codeLines.join("\n");

              return (
                <div
                  key={index}
                  className="my-4 rounded-lg overflow-hidden border border-stellar-green/30 bg-eclipse-border/30 dark:bg-space-void shadow-stellar-green-glow"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-eclipse-border/50 dark:bg-space-darker border-b border-stellar-green/30">
                    <span className="text-xs font-mono text-stellar-green">
                      {language.trim() || "CODE"}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-stellar-green hover:text-stellar-blue transition-colors"
                    >
                      📋
                    </button>
                  </div>
                  <pre className="p-4 bg-eclipse-border/30 dark:bg-space-void overflow-x-auto font-mono text-sm text-eclipse-text-light dark:text-space-text">
                    <CodeHighlighter
                      code={code}
                      language={language.trim().toLowerCase()}
                    />
                  </pre>
                </div>
              );
            }

            return (
              <p
                key={index}
                className="text-eclipse-text-light dark:text-space-text"
              >
                {section.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex} className="block mb-2 last:mb-0">
                    {line}
                  </span>
                ))}
              </p>
            );
          })}
        </div>

        {/* Divider after post description */}
        <div className="border-t border-eclipse-border/50 dark:border-space-gray/50 my-4"></div>

        {/* Attachments */}
        {post.attachments?.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {post.attachments.map((file, index) => (
              <a
                key={index}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-stellar-blue hover:text-stellar-orange transition-colors text-sm p-2 rounded border border-stellar-blue/30 hover:border-stellar-orange/50 bg-eclipse-border/50 dark:bg-space-darker shadow-stellar-blue-glow"
              >
                <FaPaperclip className="mr-2 shrink-0" />
                <span className="truncate">
                  {file.fileType.toUpperCase()} Attachment
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Footer Metrics */}
        <div className="pt-4 border-t border-eclipse-border/30 dark:border-space-gray/30 flex items-center justify-between">
          <div className="flex items-center gap-5 text-eclipse-muted-light dark:text-space-muted">
            <div className="flex items-center gap-1.5 hover:text-stellar-blue transition-colors">
              <FaEye className="w-4 h-4" />
              <span className="text-sm font-mono">{post.views}</span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-stellar-orange transition-colors"
            >
              {isLiked ? (
                <FaHeart className="w-4 h-4 text-stellar-orange" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
              <span className="text-sm font-mono">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-stellar-green transition-colors"
            >
              <FaCommentDots className="w-4 h-4" />
              <span className="text-sm font-mono">{enrichedComments.length}</span>
              {showComments ? (
                <FaChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <FaChevronDown className="w-3 h-3 ml-1" />
              )}
            </button>
          </div>

          <button
            className="px-4 py-2 bg-stellar-blue hover:bg-stellar-orange text-white rounded-lg font-medium transition-colors text-sm shadow-stellar-blue-glow border border-stellar-blue/50"
            onClick={() => setShowComments(!showComments)}
          >
            {post.postType === "query"
              ? showComments
                ? "Close Comments"
                : "Answer"
              : showComments
              ? "Close Discussion"
              : "Discuss"}
          </button>
        </div>

        {/* Divider before comments section */}
        <div className="border-t border-eclipse-border/50 dark:border-space-gray/50 mt-4"></div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-eclipse-border/30 dark:border-space-gray/30">
            {isLoading ? (
              <div className="text-stellar-blue text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-stellar-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono">Loading comments...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Comment Input */}
                <form onSubmit={handleNewCommentSubmit} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 rounded-lg bg-eclipse-surface dark:bg-space-darker border border-stellar-blue/30 text-eclipse-text-light dark:text-space-text focus:outline-none focus:border-stellar-blue focus:shadow-stellar-blue-glow placeholder-eclipse-muted-light dark:placeholder-space-muted transition-colors font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stellar-green hover:bg-stellar-blue rounded-lg font-medium text-white transition-colors shadow-stellar-green-glow border border-stellar-green/50"
                  >
                    Send
                  </button>
                </form>

                {/* Comments Container */}
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {enrichedComments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-eclipse-border/10 dark:hover:bg-space-light/10 transition-colors"
                    >
                      <div className="shrink-0">
                        {comment.author.profilePic ? (
                          <img
                            src={comment.author.profilePic}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full border border-stellar-blue/50 object-cover shadow-stellar-blue-glow"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-stellar-blue flex items-center justify-center shadow-stellar-blue-glow">
                            <span className="text-xs text-white">
                              {comment.author.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-eclipse-text-light dark:text-space-text truncate">
                            {comment.author.username}
                          </span>
                          <span className="text-xs text-eclipse-muted-light dark:text-space-muted shrink-0 font-mono">
                            {comment.dateTime
                              ? formatDistanceToNow(new Date(comment.dateTime), {
                                  addSuffix: true,
                                })
                              : `Unknown Time`}
                          </span>
                        </div>
                        <p className="text-eclipse-text-light dark:text-space-text text-sm break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Empty State */}
                  {enrichedComments.length === 0 && (
                    <div className="text-center py-4 text-eclipse-muted-light dark:text-space-muted">
                      <span className="font-mono">No comments yet. Be the first to comment!</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
