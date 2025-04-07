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
import { CodeHighlighter } from "./CodeHighlighter.jsx";
import { useNavigate } from "react-router-dom";

export const PostCard = ({ post: initialPost }) => {
  const [post,setPost]=useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length || 0); //state to hold likes count
  const [newCommentContent, setNewCommentContent] = useState(""); //state to hold new comment content
  const [showComments, setShowComments] = useState(false); //state to toggle comments
  const [enrichedComments, setEnrichedComments] = useState([]); //state to hold comments with user details
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });
  const [user,setUser] = useState(localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):null);
  const navigate= useNavigate();

  //? post can be fetched from localstorage,no need to pass it as prop.
  //* This component is rendered on  multiple pages, so we can not use the same post object

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
        const liked = post.likes.find((like) => like.userId === user?._id);
        if (liked) setIsLiked(true);
      }
    };
    checkLikeStatus();
  }, [post.likes, user]);

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

  //using SSE to dynamically update comments and likes
  useEffect(() => {
    console.log("Initializing EventSource for post:");
    
    const eventSource = new EventSource("http://localhost:3000/stream",{withCredentials:true});
    // console.log("EventSource initialized for post:", post._id);
    
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE data:", data);
      
      //handle like manupulation
      if (data.type === "like" && data.postId === post._id) {
        // Check if the userId already exists in the likes array
        const alreadyLiked = post.likes.some((like) => like.userId === data.userId); 
        if (!alreadyLiked) {

          const userPayload = {
            userId: data.userId,
            username: data.username,
            profilePic: data.profilePic,
            dateTime: data.dateTime,
          };
          // Update the likes array immutably
           post.likes.push(userPayload);
            const updatedLikes = [...post.likes];
          
          setPost((prevPost) => ({ ...prevPost, likes: updatedLikes }));
          setLikesCount(updatedLikes.length);
    
          // Update the isLiked state if the current user liked the post
          if (data.userId === user._id) {
            setIsLiked(true);
            toast.success("Post liked successfully!");
          }
          console.log("AFter like post",post.likes);

          // Update the likes count
          
    
          //! No need to update the likes count here, as it's already being handled by the state update above
          // Update local storage with the entire cached posts array
          // const cachedPosts = JSON.parse(localStorage.getItem("cachedPosts")) || [];
          // console.log("cachedPost._id === post._id ",cachedPosts.map((cachedPost)=> cachedPost._id === post._id));
          
          // const updatedPosts = cachedPosts.map((cachedPost) =>
          //   cachedPost._id === post._id ? { ...cachedPost, likes: updatedLikes } : cachedPost
          // );

          
          // console.log("Updated posts in local storage:", updatedPosts);
          
          // localStorage.setItem("cachedPosts", JSON.stringify(updatedPosts));
          // setLikesCount(updatedLikes.length);
        }
      } 
      //handle comment manipulation
      else if (data.type === "comment" && data.postId === post._id) {
        setEnrichedComments((prev) => [
          ...prev,
          {
            author: {
              userId: data.author.userId,
              username: data.author.username, // Update with proper user info
              profilePic: data.author.profilePic,
            },
            postId: data.postId,
            content: data.content,
            dateTime: data.dateTime,
          },
        ]);
        // console.log("New comment received:", data);
        
      }
    };

    eventSource.onerror = () => {
      console.log("EventSource failed. Closing connection.");
      eventSource.close();
    };
  
    return () => {
      eventSource.close();
    };
  }, [ post._id, user._id, post.likes, post.comments]);
  


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
            title={`"Created"} at ${new Date(post.updatedAt).toLocaleString()}`}
          >
            {"⏳"} {timeAgo}
          </span>
        </div>
      </div>

      {/* Preserved Author Section */}
      <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={()=> navigate(`/profile/${post.author.userId}`)}
        title={`View ${post.author?.username || "Unknown User"}'s profile`}>
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

      {/* Enhanced Content Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-2xl font-orbitron text-corona bg-gradient-to-r from-nebula/20 to-transparent p-4 rounded-lg border border-nebula/30">
          {post.title}
        </h3>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-nebula/10 to-supernova/5 rounded-xl transition-opacity opacity-0 group-hover:opacity-100" />

          <div className="relative space-y-4 text-stardust/90 leading-relaxed">
          {post.content.split('\n```').map((section, index) => {
  if (index % 2 === 1) {
    const [language, ...codeLines] = section.split('\n');
    const code = codeLines.join('\n');
    
    return (
      <div key={index} className="my-4 rounded-xl overflow-hidden border border-nebula/30">
        <div className="flex items-center justify-between px-4 py-2 bg-cosmic/80 border-b border-nebula/30">
          <span className="text-xs font-mono text-supernova">
            {language.trim() || 'CODE'}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-nebula hover:text-supernova transition-colors"
          >
            📋
          </button>
        </div>
        <pre className="p-4 bg-cosmic/50 overflow-x-auto font-mono text-sm">
          {/* This is where CodeHighlighter gets rendered */}
          <CodeHighlighter code={code} language={language.trim().toLowerCase()} />
        </pre>
      </div>
    );
  }

              // Regular text content
              return (
                <p
                  key={index}
                  className="p-4 bg-cosmic/30 rounded-xl border border-nebula/20 hover:border-nebula/40 transition-colors"
                >
                  {section.split("\n").map((line, lineIndex) => (
                    <span key={lineIndex} className="block mb-3 last:mb-0">
                      {line}
                    </span>
                  ))}
                </p>
              );
            })}
          </div>
        </div>
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
              {/* {post.likes.length + (isLiked ? 1 : 0)}
               */}
               {likesCount}
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

        <button
          className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova rounded-lg font-medium text-cosmic hover:brightness-110 transition-all text-sm"
          onClick={() => setShowComments(!showComments)}
        >
          {post.postType === "query" ? 
          showComments? "Close Comments" : "Transmit Answer"  :
           showComments? "Close Discussion" :"Engage Discussion"
           }
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
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {" "}
            {/* Added max height and scroll */}
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
                <div className="flex-1 min-w-0">
                  {" "}
                  {/* Added min-width to prevent overflow */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-stardust truncate">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-nebula/60 shrink-0">
                      {comment.dateTime
                        ? formatDistanceToNow(new Date(comment.dateTime), {
                            addSuffix: true,
                          })
                        : `Unknown Time`}
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
