import React, { useState, useEffect } from "react";
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

export const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");   //state to hold new comment content
  const [showComments, setShowComments] = useState(false);  //state to toggle comments
  const [enrichedComments, setEnrichedComments] = useState([]); //state to hold comments with user details
  const timeAgo = formatDistanceToNow(
    new Date(post.createdAt),
    {
      addSuffix: true,
    }
  );


  // Preserved metadata section
  const MAX_VISIBLE_TAGS = 2;
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagsCount = post.tags.length - MAX_VISIBLE_TAGS;

  //fetch usersIds with their comments
  useEffect(() => {
    const fetchCommentsWithUsers = async () => {
      try {
        // Extract unique userIds from comments
        const userIds = [
          ...new Set(post.comments.map((comment) => comment.userId)),
        ];

        // Fetch user details for these userIds
        const users = await fetchUsersByIds(userIds);

        // Map user details back to comments
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


  // Check if the post is liked by the user
  useEffect(() => {
    const checkLikeStatus = () => {
      if (post.likes?.length > 0) {
        const user = JSON.parse(localStorage.getItem("user"));
        const liked = post.likes.find((like) => like.userId === user?._id);
        if (liked) setIsLiked(true);
      }
    };
    checkLikeStatus();
  }, [post.likes]);

  // Handle like button click
  const handleLike = () => {
    if (isLiked) {
      toast.error("You've already launched this post!");
      return;
    }
    likePost(post);
    setIsLiked(!isLiked);
  };

  // Handle new comment submission
  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) {
      toast.error("Signal cannot be empty!");
      return;
    }

    try {
      const newComment = await createComment(post._id, newCommentContent);
      // console.log("New comment created from backend:", newComment);
      
      setEnrichedComments([...enrichedComments, newComment]);
      setNewCommentContent("");
      toast.success("Signal transmitted successfully!");
    } catch (error) {
      toast.error("Failed to send signal");
      console.error("Comment error:", error);
    }
  };

  //? debugging purposes
  // useEffect(() => {
  //   console.log("Enriched comments:", enrichedComments);
  // }
  // , [enrichedComments]);
    

  return (
    <div
      className={`p-4 mb-4 rounded-xl border ${
        post.postType === "query"
          ? "border-l-4 border-nebula"
          : "border-l-4 border-supernova"
      } bg-gradient-to-br from-stellar/80 to-cosmic/90 backdrop-blur-lg transition-all hover:-translate-y-1`}
    >
      {/* Preserved Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium rounded-full bg-nebula/10 text-stardust border border-nebula/20"
            >
              #{tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="px-3 py-1 text-sm text-stardust/60">
              +{hiddenTagsCount} more
            </span>
          )}
        </div>

        {/* Preserved Metadata */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              post.postType === "query"
                ? "bg-nebula/20 text-nebula"
                : "bg-supernova/20 text-supernova"
            }`}
          >
            {post.postType.toUpperCase()}
          </span>
          <span
            className="text-sm text-stardust/60"
            title={`"Created"} at ${new Date(
              post.updatedAt
            ).toLocaleString()}`}
          >
            {"⏳"} {timeAgo}
          </span>
        </div>
      </div>

      {/* Preserved Author Section */}
      <div className="flex items-center gap-3 mb-4">
        {post.author?.profilePic ? (
          <img
            src={post.author.profilePic}
            alt={post.author.username}
            className="w-9 h-9 rounded-full border-2 border-nebula/50 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-nebula to-supernova flex items-center justify-center">
            <span className="text-sm font-bold text-cosmic">
              {post.author?.username[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-base font-orbitron text-stardust">
            {post.author?.username}
          </span>
          {post.author?.role && (
            <span className="text-xs text-nebula/70 font-medium">
              {post.author.role}
            </span>
          )}
        </div>
      </div>

      {/* Preserved Content Section */}
      <div className="mb-4 space-y-3">
        <h3 className="text-xl font-orbitron text-corona">{post.title}</h3>
        <p className="text-stardust/80 leading-relaxed">{post.content}</p>
      </div>

      {/* Preserved Attachments */}
      {post.attachments?.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {post.attachments.map((file, index) => (
            <a
              key={index}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-nebula hover:text-supernova transition-colors text-sm"
            >
              <FaPaperclip className="mr-2 shrink-0" />
              <span className="truncate">
                {file.fileType.toUpperCase()} Attachment
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Preserved Footer Metrics */}
      <div className="pt-4 border-t border-nebula/20 flex items-center justify-between">
        <div className="flex items-center gap-5 text-stardust/80">
          <div className="flex items-center gap-1.5">
            <FaEye className="w-4 h-4 text-nebula/80" />
            <span className="text-sm">{post.views}</span>
          </div>

          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-supernova transition-colors"
          >
            {isLiked ? (
              <FaHeart className="w-4 h-4 text-supernova" />
            ) : (
              <FaRegHeart className="w-4 h-4" />
            )}
            <span className="text-sm">
              {post.likes.length + (isLiked ? 1 : 0)}
            </span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-corona transition-colors"
          >
            <FaCommentDots className="w-4 h-4 text-corona/80" />
            <span className="text-sm">{enrichedComments.length}</span>
            {showComments ? (
              <FaChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <FaChevronDown className="w-3 h-3 ml-1" />
            )}
          </button>
        </div>

        <button className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova rounded-lg font-medium text-cosmic hover:brightness-110 transition-all text-sm">
          {post.postType === "query" ? "Transmit Answer" : "Engage Discussion"}
        </button>
      </div>

      {/* Added Comment Section */}
      {showComments && (
  <div className="mt-4 pt-4 border-t border-nebula/20">
    {/* Comment Input */}
    <form onSubmit={handleNewCommentSubmit} className="mb-4 flex gap-2">
      <input
        type="text"
        value={newCommentContent}
        onChange={(e) => setNewCommentContent(e.target.value)}
        placeholder="Transmit your signal..."
        className="flex-1 px-4 py-2 rounded-lg bg-cosmic/50 border border-nebula/30 text-stardust focus:outline-none focus:border-supernova/50 placeholder-stardust/40"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gradient-to-r from-nebula/80 to-supernova/80 rounded-lg font-medium text-cosmic hover:brightness-110 transition-all"
      >
        Send
      </button>
    </form>

    {/* Scrollable Comments Container */}
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max height and scroll */}
      {enrichedComments.map((comment) => (
        <div 
          key={comment._id}
          className="flex items-start gap-3 p-3 rounded-lg bg-cosmic/30 hover:bg-cosmic/40 transition-colors"
        >
          <div className="shrink-0">
            {comment.author.profilePic ? (
              <img
                src={comment.author.profilePic}
                alt={comment.author.username}
                className="w-7 h-7 rounded-full border border-nebula/50 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-nebula to-supernova flex items-center justify-center">
                <span className="text-xs text-cosmic">
                  {comment.author.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0"> {/* Added min-width to prevent overflow */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-stardust truncate">
                {comment.author.username}
              </span>
              <span className="text-xs text-nebula/60 shrink-0">
                {comment.dateTime? formatDistanceToNow(new Date(comment.dateTime), { addSuffix: true }):`Unknown Time`}
              </span>
            </div>
            <p className="text-stardust/80 text-sm break-words">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
      
      {/* Empty State */}
      {enrichedComments.length === 0 && (
        <div className="text-center py-4 text-stardust/50">
          No signals received yet. Be the first to respond!
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
};
