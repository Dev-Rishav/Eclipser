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
      className={`p-6 mb-4 rounded-lg border bg-white shadow-sm transition-all hover:shadow-md ${
        post.postType === "query"
          ? "border-l-4 border-blue-500"
          : "border-l-4 border-pink-500"
      }`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200"
            >
              #{tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="px-3 py-1 text-sm text-gray-500">
              +{hiddenTagsCount} more
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              post.postType === "query"
                ? "bg-blue-100 text-blue-800"
                : "bg-pink-100 text-pink-800"
            }`}
          >
            {post.postType.toUpperCase()}
          </span>
          <span
            className="text-sm text-gray-500"
            title={`Created at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Author Section */}
      <div
        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => navigate("/profile", {
          state: { userId: post.author.userId }
        })}
        title={`View ${post.author?.username || "Unknown User"}'s profile`}
      >
        {post.author?.profilePic ? (
          <img
            src={post.author.profilePic}
            alt={post.author.username}
            className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {post.author?.username[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-base font-semibold text-gray-900">
            {post.author?.username}
          </span>
          {post.author?.role && (
            <span className="text-xs text-gray-500 font-medium">
              {post.author.role}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 bg-gray-50 p-4 rounded-lg border">
          {post.title}
        </h3>

        <div className="space-y-4 text-gray-800 leading-relaxed">
          {post.content.split("\n```").map((section, index) => {
            if (index % 2 === 1) {
              const [language, ...codeLines] = section.split("\n");
              const code = codeLines.join("\n");

              return (
                <div
                  key={index}
                  className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                    <span className="text-xs font-mono text-gray-600">
                      {language.trim() || "CODE"}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                  <pre className="p-4 bg-gray-50 overflow-x-auto font-mono text-sm">
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
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
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

        {/* Attachments */}
        {post.attachments?.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {post.attachments.map((file, index) => (
              <a
                key={index}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm p-2 rounded border border-gray-200 hover:border-blue-300 bg-blue-50"
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
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-5 text-gray-600">
            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <FaEye className="w-4 h-4" />
              <span className="text-sm">{post.views}</span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
            >
              {isLiked ? (
                <FaHeart className="w-4 h-4 text-red-500" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
              <span className="text-sm">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <FaCommentDots className="w-4 h-4" />
              <span className="text-sm">{enrichedComments.length}</span>
              {showComments ? (
                <FaChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <FaChevronDown className="w-3 h-3 ml-1" />
              )}
            </button>
          </div>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isLoading ? (
              <div className="text-blue-600 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading comments...
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
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-500 placeholder-gray-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors"
                  >
                    Send
                  </button>
                </form>

                {/* Comments Container */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {enrichedComments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="shrink-0">
                        {comment.author.profilePic ? (
                          <img
                            src={comment.author.profilePic}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-xs text-white">
                              {comment.author.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {comment.author.username}
                          </span>
                          <span className="text-xs text-gray-500 shrink-0">
                            {comment.dateTime
                              ? formatDistanceToNow(new Date(comment.dateTime), {
                                  addSuffix: true,
                                })
                              : `Unknown Time`}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Empty State */}
                  {enrichedComments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No comments yet. Be the first to comment!
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
