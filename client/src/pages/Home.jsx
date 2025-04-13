import { useEffect, useState } from "react";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { PostCard } from "../components/PostCard";
import FeedControlBar from "../components/FeedControlBar";
import { AnimatePresence, motion } from "framer-motion";
import { HighlightSyntax } from "../components/HighlightSyntax";
import { toast } from "react-hot-toast";
import { createPost } from "../utility/createPost";
import { useSelector } from "react-redux";
import { clearPostCache } from "../utility/storageCleaner";
import { usePostLoader } from "../hooks/usePostLoader";
import { fetchRecentChats } from "../utility/chatUtils";

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

    //* onreload clear posts cache
    useEffect(() => {
      const handleBeforeUnload = () => {
        clearPostCache();
      };
    
      window.addEventListener('beforeunload', handleBeforeUnload);
    
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, []);
    

  // //! [TODO]: code snippet is broken
  // //! [TODO]: add a loading state for the post creation
  // //! [TODO]: add a loading state for the post fetching
  // //! [TODO]: add a loading state for the post deletion
  // //! [TODO]: add a loading state for the post update
  // //! [TODO]: side components are getting mounted multiple times while scrolling

  //* handle post creation
  const handleCreatePost = async () => {
    try {
      const createdPost = await createPost(newPost); // Use the utility function
      setPosts([createdPost, ...posts]); // Add the new post to the state
      localStorage.setItem("cachedPosts", JSON.stringify([createdPost, ...posts]));
      setIsCreatingPost(false); // Close the modal
      setNewPost({
        title: "",
        content: "",
        postType: "query",
        tags: [],
        codeSnippet: "",
        language: "javascript",
      }); // Reset the form fields
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post"); // Show an error toast
    }
  };

  //* Show loading animation for 1.5 seconds
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, [setIsLoading]);


  //TODO: add infinite scroll for the recent chats its best to show upto 3 recent chats at a time
  //load recent chats
  useEffect(() => {
    const loadChats = async () => {
      const recentChats = await fetchRecentChats();
      setChats(recentChats.chats);
    };
    loadChats();
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic to-stellar">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreatingPost(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 
      bg-gradient-to-r from-supernova to-corona text-cosmic 
      px-6 py-3 rounded-full shadow-galaxy hover:scale-105 
      transition-transform duration-300 ease-in-out font-bold"
      >
        ✨ New Transmission
      </button>
      
      <div className="lg:grid lg:grid-cols-12 gap-3 p-3 mx-auto">

        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-3 ">
          <div
            className={`space-y-6  transition-all duration-300 
        `}
          >
            <SubscribedTopicsList />
            <QuickAccess />
          </div>
        </div>

        {/* Main Feed */}
        <main className="lg:col-span-6 ">
          <div className="sticky top-0 z-10 bg-gradient-to-b from-cosmic to-cosmic/90 backdrop-blur-lg pb-2">
            <FeedControlBar
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
          </div>

          {isLoading ? (
            <p className="text-center text-corona mt-4 text-lg text-orbitron">Summoning your cosmic feed...</p>
          ) : (
            <>
              {/* Existing Posts */}
              <div className="space-y-4 mb-4">
                {(user?.subscribedTopics || []).length === 0 && (
                  <div className="bg-gradient-to-br from-stellar/80 to-cosmic/90 p-3  rounded-xl border-2 border-nebula/30 backdrop-blur-sm text-center">
                  <span className="text-lg font-orbitron text-stardust/80 mb-2 inline-block">
                    🌌 No Celestial Tags Locked In
                  </span>
                  <p className="text-stardust/60 text-sm">
                    Catching stardust from across the universe...
                    <span className="ml-2 animate-pulse">✨</span>
                  </p>
                </div>
                )}
              </div>
              {livePosts.length > 0 && (
                <div
                  className="text-center bg-yellow-200 text-black p-2 rounded mb-4 cursor-pointer hover:bg-yellow-300 transition"
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
                <p className="text-center text-blue-300 font-bold mt-4">
                  All posts eclipsed. Await the next cosmic alignment!
                </p>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <div className=" lg:block lg:col-span-3 hidden">
          <div className={`space-y-6 sticky transition-all duration-300 `}>
            <LiveActivity />
            <ChatPreview
            chats={chats}
            title="Stellar Communications"
            onStartNewChat={() => {
              console.log("Starting new chat...");
            }}
            />
          </div>
        </div>

        {/* Creation Modal Overlay */}
        <AnimatePresence>
          {isCreatingPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
              onClick={() => setIsCreatingPost(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-stellar to-cosmic rounded-xl 
                border border-nebula/30 w-full max-w-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl text-corona font-orbitron">
                    Create Transmission
                  </h2>
                  <button
                    onClick={() => setIsCreatingPost(false)}
                    className="text-stardust hover:text-supernova transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Transmission Title"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                  />

                  <textarea
                    placeholder="Compose your cosmic message..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    className="w-full h-32 px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                  />

                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={newPost.tags}
                      onChange={(e) =>
                        setNewPost({ ...newPost, tags: e.target.value })
                      }
                      className="flex-1 px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                    />

                    <select
                      value={newPost.postType}
                      onChange={(e) =>
                        setNewPost({ ...newPost, postType: e.target.value })
                      }
                      className="px-3 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                    >
                      <option value="query">📡 Query</option>
                      <option value="achievement">🏆 Achievement</option>
                      <option value="discussion">💬 Discussion</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNewPost({ ...newPost, codeSnippet: "" })
                      }
                      className="px-3 py-2 bg-nebula/10 border border-nebula/30 rounded-lg text-stardust hover:bg-nebula/20"
                    >
                      {newPost.codeSnippet ? "Remove Code" : "Add Code Snippet"}
                    </button>

                    {newPost.codeSnippet && (
                      <div className="space-y-2">
                        <select
                          value={newPost.language}
                          onChange={(e) =>
                            setNewPost({ ...newPost, language: e.target.value })
                          }
                          className="px-3 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>

                        <HighlightSyntax
                          language={newPost.language}
                          value={newPost.codeSnippet}
                          onChange={(value) =>
                            setNewPost({ ...newPost, codeSnippet: value })
                          }
                          className="rounded-lg border border-nebula/30"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCreatePost}
                    className="w-full py-3 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg hover:brightness-110"
                  >
                    Transmit to Cosmos
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePage;
