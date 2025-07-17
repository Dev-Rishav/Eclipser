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
    const eventSource = new EventSource("http://localhost:3000/stream", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

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
      } else if (data.type === "comment" && data.postId === post._id) {
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

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [post._id, user._id, post.likes, post.comments]);

  return (
    <div
      className={`p-6 mb-4 rounded-lg border bg-cyber-dark shadow-cyber-blue-glow transition-all hover:shadow-cyber-purple-glow ${
        post.postType === "query"
          ? "border-l-4 border-cyber-blue"
          : "border-l-4 border-cyber-purple"
      } border-cyber-dark`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium rounded-full bg-cyber-black/50 text-cyber-blue border border-cyber-blue/30 shadow-cyber-blue-glow"
            >
              #{tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="px-3 py-1 text-sm text-cyber-text/60">
              +{hiddenTagsCount} more
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded text-xs font-bold font-mono ${
              post.postType === "query"
                ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30"
                : "bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30"
            }`}
          >
            {post.postType.toUpperCase()}
          </span>
          <span
            className="text-sm text-cyber-text/60 font-mono"
            title={`Created at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Author Section */}
      <div
        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-cyber-black/30 p-2 rounded-lg transition-colors border border-cyber-blue/20"
        onClick={() => navigate("/profile", {
          state: { userId: post.author.userId }
        })}
        title={`View ${post.author?.username || "Unknown User"}'s profile`}
      >
        {post.author?.profilePic ? (
          <img
            src={post.author.profilePic}
            alt={post.author.username}
            className="w-10 h-10 rounded-full border-2 border-cyber-blue/50 object-cover shadow-cyber-blue-glow"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center shadow-cyber-blue-glow">
            <span className="text-sm font-bold text-white">
              {post.author?.username[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-base font-semibold text-cyber-text">
            {post.author?.username}
          </span>
          {post.author?.role && (
            <span className="text-xs text-cyber-blue font-medium font-mono">
              {post.author.role}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-xl font-bold text-cyber-text bg-cyber-black/50 p-4 rounded-lg border border-cyber-blue/30 shadow-cyber-blue-glow">
          {post.title}
        </h3>

        <div className="space-y-4 text-cyber-text leading-relaxed">
          {post.content.split("\n```").map((section, index) => {
            if (index % 2 === 1) {
              const [language, ...codeLines] = section.split("\n");
              const code = codeLines.join("\n");

              return (
                <div
                  key={index}
                  className="my-4 rounded-lg overflow-hidden border border-cyber-green/30 bg-cyber-black/50 shadow-cyber-green-glow"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-cyber-dark border-b border-cyber-green/30">
                    <span className="text-xs font-mono text-cyber-green">
                      {language.trim() || "CODE"}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-cyber-green hover:text-cyber-blue transition-colors"
                    >
                      📋
                    </button>
                  </div>
                  <pre className="p-4 bg-cyber-black/70 overflow-x-auto font-mono text-sm text-cyber-text">
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
                className="p-4 bg-cyber-black/30 rounded-lg border border-cyber-blue/20"
              >
                {section.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex} className="block mb-2 last:mb-0 text-cyber-text">
                    {line}
                  </span>
                ))}
              </p>
            );
          })}
        </div>

        {/* Attachments */}
        {post.attachments?.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {post.attachments.map((file, index) => (
              <a
                key={index}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-cyber-blue hover:text-cyber-purple transition-colors text-sm p-2 rounded border border-cyber-blue/30 hover:border-cyber-purple/50 bg-cyber-black/30 shadow-cyber-blue-glow"
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
        <div className="pt-4 border-t border-cyber-blue/30 flex items-center justify-between">
          <div className="flex items-center gap-5 text-cyber-text/80">
            <div className="flex items-center gap-1.5 hover:text-cyber-blue transition-colors">
              <FaEye className="w-4 h-4" />
              <span className="text-sm font-mono">{post.views}</span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-cyber-orange transition-colors"
            >
              {isLiked ? (
                <FaHeart className="w-4 h-4 text-cyber-orange" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
              <span className="text-sm font-mono">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-cyber-green transition-colors"
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
            className="px-4 py-2 bg-cyber-blue hover:bg-cyber-purple text-white rounded-lg font-medium transition-colors text-sm shadow-cyber-blue-glow border border-cyber-blue/50"
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

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-cyber-blue/30">
            {isLoading ? (
              <div className="text-cyber-blue text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
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
                    className="flex-1 px-4 py-2 rounded-lg bg-cyber-black/50 border border-cyber-blue/30 text-cyber-text focus:outline-none focus:border-cyber-blue focus:shadow-cyber-blue-glow placeholder-cyber-text/60 transition-colors font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyber-green hover:bg-cyber-blue rounded-lg font-medium text-white transition-colors shadow-cyber-green-glow border border-cyber-green/50"
                  >
                    Send
                  </button>
                </form>

                {/* Comments Container */}
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {enrichedComments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-cyber-black/30 border border-cyber-blue/20"
                    >
                      <div className="shrink-0">
                        {comment.author.profilePic ? (
                          <img
                            src={comment.author.profilePic}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full border border-cyber-blue/50 object-cover shadow-cyber-blue-glow"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center shadow-cyber-blue-glow">
                            <span className="text-xs text-white">
                              {comment.author.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-cyber-text truncate">
                            {comment.author.username}
                          </span>
                          <span className="text-xs text-cyber-text/60 shrink-0 font-mono">
                            {comment.dateTime
                              ? formatDistanceToNow(new Date(comment.dateTime), {
                                  addSuffix: true,
                                })
                              : `Unknown Time`}
                          </span>
                        </div>
                        <p className="text-cyber-text/90 text-sm break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Empty State */}
                  {enrichedComments.length === 0 && (
                    <div className="text-center py-4 text-cyber-text/60">
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
