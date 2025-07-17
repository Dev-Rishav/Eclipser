import { useEffect, useState } from "react";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { PostCard } from "../components/PostCard";
import FeedControlBar from "../components/FeedControlBar";
import { HighlightSyntax } from "../components/HighlightSyntax";
import { toast } from "react-hot-toast";
import { createPost } from "../utility/createPost";
import { useSelector } from "react-redux";
import { clearPostCache } from "../utility/storageCleaner";
import { usePostLoader } from "../hooks/usePostLoader";
import { fetchRecentChats } from "../utility/chatUtils";
import { AnimatedModal } from "../components/AnimateModal";
import { ChatModal } from "../components/ChatModal";
import socket from "../config/socket";

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    postType: "query",
    tags: [],
    codeSnippet: "",
    language: "javascript",
  });
  const user = useSelector((state) => state.auth.user);
  const {
    posts,
    setPosts,
    isLoading,
    lastPostRef,
    allPostsExhausted,
    livePosts,
    setLivePosts,
    setIsLoading,
  } = usePostLoader(user);
  const [chats, setChats] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearPostCache();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, [setIsLoading]);

  useEffect(() => {
    const loadChats = async () => {
      const recentChats = await fetchRecentChats();
      setChats(recentChats.chats);
    };
    loadChats();
  }, []);

  const loadMoreChats = async () => {
    if (!hasMoreChats) return;

    const response = await fetchRecentChats(page + 1);
    setChats((prev) => [...prev, ...response.chats]);
    setPage((prev) => prev + 1);
    setHasMoreChats(response.chats.length > 0);
  };

  useEffect(() => {
    console.log("selectedChat", selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    socket.connect();
    console.log("Socket connected");
    socket.emit("register", user._id);

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreatingPost(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 
        bg-blue-600 hover:bg-blue-700 text-white 
        px-6 py-3 rounded-full shadow-lg hover:shadow-xl 
        transition-all duration-300 font-medium"
      >
        ✨ New Post
      </button>

      <div className="lg:grid lg:grid-cols-12 gap-6 p-6 mx-auto max-w-7xl">
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="space-y-6 sticky top-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <SubscribedTopicsList />
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <QuickAccess />
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <main className="lg:col-span-6">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg pb-4 mb-4">
            <FeedControlBar
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
          </div>

          {isLoading ? (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3 text-blue-600 font-medium text-lg">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading your feed...
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {(user?.subscribedTopics || []).length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <span className="text-lg font-medium text-blue-800 mb-2 inline-block">
                      🏷️ No Topics Subscribed
                    </span>
                    <p className="text-blue-600 text-sm">
                      Subscribe to topics to see personalized content...
                    </p>
                  </div>
                )}
              </div>
              
              {livePosts.length > 0 && (
                <div
                  className="text-center bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => {
                    setPosts((prev) => [...livePosts, ...prev]);
                    localStorage.setItem(
                      "cachedPosts",
                      JSON.stringify([...livePosts, ...posts])
                    );
                    setLivePosts([]);
                  }}
                >
                  🔔 {livePosts.length} new post(s) available. Click to load!
                </div>
              )}

              {posts.map((post, index) => {
                const isLast = index === posts.length - 1;
                return (
                  <div key={post._id} ref={isLast ? lastPostRef : null}>
                    <PostCard post={post} />
                  </div>
                );
              })}

              {allPostsExhausted && (
                <div className="text-center bg-gray-100 border border-gray-200 p-4 rounded-lg">
                  <p className="text-gray-600 font-medium">
                    All posts loaded. Check back later for new content!
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <div className="lg:block lg:col-span-3 hidden">
          <div className="space-y-6 sticky top-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <LiveActivity />
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <ChatPreview
                chats={chats}
                title="Recent Chats"
                onStartNewChat={() => {
                  setIsChatOpen(true);
                  setSelectedChat(null);
                }}
                onLoadMore={loadMoreChats}
                hasMore={hasMoreChats}
                onSelectChat={(chat) => {
                  setSelectedChat(chat);
                  setIsChatOpen(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        <AnimatedModal
          isOpen={isChatOpen}
          onClose={() => {}}
        >
          <ChatModal
            chat={selectedChat}
            onClose={() => {
              setIsChatOpen(false);
              console.log("Chat closed");
              setSelectedChat(null);
            }}
          />
        </AnimatedModal>

        {/* Creation Modal */}
        <AnimatedModal
          isOpen={isCreatingPost}
          onClose={() => setIsCreatingPost(false)}
        >
          <div className="bg-white rounded-lg p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl text-gray-900 font-bold">
                Create Post
              </h2>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />

              <textarea
                placeholder="Write your post content..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className="w-full h-32 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({ ...newPost, tags: e.target.value })
                  }
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />

                <select
                  value={newPost.postType}
                  onChange={(e) =>
                    setNewPost({ ...newPost, postType: e.target.value })
                  }
                  className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="query">📝 Query</option>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="discussion">💬 Discussion</option>
                </select>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setNewPost({ ...newPost, codeSnippet: newPost.codeSnippet ? "" : "// Enter code snippet..." })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  {newPost.codeSnippet ? "Remove Code" : "Add Code Snippet"}
                </button>

                {newPost.codeSnippet && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <select
                      value={newPost.language}
                      onChange={(e) =>
                        setNewPost({ ...newPost, language: e.target.value })
                      }
                      className="px-3 py-2 bg-white rounded border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="rust">Rust</option>
                    </select>

                    <HighlightSyntax
                      language={newPost.language}
                      value={newPost.codeSnippet}
                      onChange={(value) =>
                        setNewPost({ ...newPost, codeSnippet: value })
                      }
                      className="rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleCreatePost}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Post
              </button>
            </div>
          </div>
        </AnimatedModal>
      </div>
    </div>
  );
};

export default HomePage;
