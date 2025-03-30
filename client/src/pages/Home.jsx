import React, { useEffect, useState } from "react";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { PostCard } from "../components/PostCard";
import FeedControlBar from "../components/FeedControlBar";
import { fetchPosts } from "../utility/fetchPost";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from 'framer-motion';
import { HighlightSyntax } from '../components/HighlightSyntax';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import { createPost } from "../utility/createPost";

const socket = io("http://localhost:3000");

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [posts, setPosts] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    postType: 'query',
    tags: [],
    codeSnippet: '',
    language: 'javascript'
  });
  const [localStorageUpdate, setLocalStorageUpdate] = useState(false);

//! [TODO]: code snippet is broken 

  const handleCreatePost = async () => {
    try {
      const createdPost = await createPost(newPost); // Use the utility function
      setPosts([createdPost, ...posts]); // Add the new post to the state
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
      toast.error("Failed to create post"); // Show an error toast
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for new posts via WebSocket
  useEffect(() => {
    getPosts();

    // Listen for new posts via WebSocket
    socket.on("newPost", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setLocalStorageUpdate(true); 
      //write it in local storage too
      console.log("new post binded", newPost);
    });

    return () => {
      socket.off("newPost");
    };
  }, []);

  //! koi post delete karne se both local storage and backend k redis se hatana padega

  // Polling every 60 seconds to fetch new posts
  useEffect(() => {
    const interval = setInterval(() => {
      getPosts(); // Use getPosts to fetch and update the posts state
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPosts = async () => {
    const data = await fetchPosts();
    setPosts(data);
  };

  //! set an order that this local storage state gets triggered only after the socket is checked for new posts

  // local storage needed to be updated whenever posts state are updated
  useEffect(() => {
    if (localStorageUpdate) {
      localStorage.setItem("cachedPosts", JSON.stringify(posts));
      console.log("WRITING LOCAL storage");
      setLocalStorageUpdate(false);
    }
    else
      console.log("NOT WRITING LOCAL storage");
  }, [posts, localStorageUpdate]);

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
    <div className="hidden lg:block lg:col-span-3">
      <div className={`space-y-6 sticky transition-all duration-300 
        ${scrollY > 100 ? '-translate-x-[120%]' : 'translate-x-0'}`}>
        <SubscribedTopicsList />
        <QuickAccess />
      </div>
    </div>

    {/* Main Feed */}
    <main className="lg:col-span-6">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-cosmic to-cosmic/90 backdrop-blur-lg pb-2">
        <FeedControlBar 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </div>
      
        


      {/* Existing Posts */}
      <div className="space-y-4">
        {posts.map(post => <PostCard key={post._id} post={post} />)}
      </div>
    </main>

    {/* Right Sidebar */}
    <div className="hidden lg:block lg:col-span-3">
      <div className={`space-y-6 sticky transition-all duration-300 
        ${scrollY > 100 ? 'translate-x-[120%]' : 'translate-x-0'}`}>
        <LiveActivity />
        <ChatPreview />
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
                  <h2 className="text-2xl text-corona font-orbitron">Create Transmission</h2>
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
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                  />

                  <textarea
                    placeholder="Compose your cosmic message..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="w-full h-32 px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                  />

                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                      className="flex-1 px-4 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                    />
                    
                    <select
                      value={newPost.postType}
                      onChange={(e) => setNewPost({...newPost, postType: e.target.value})}
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
                      onClick={() => setNewPost({...newPost, codeSnippet: ''})}
                      className="px-3 py-2 bg-nebula/10 border border-nebula/30 rounded-lg text-stardust hover:bg-nebula/20"
                    >
                      {newPost.codeSnippet ? 'Remove Code' : 'Add Code Snippet'}
                    </button>

                    {newPost.codeSnippet && (
                      <div className="space-y-2">
                        <select
                          value={newPost.language}
                          onChange={(e) => setNewPost({...newPost, language: e.target.value})}
                          className="px-3 py-2 bg-stellar rounded-lg border border-nebula/30 text-stardust"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>
                        
                        <HighlightSyntax
                          language={newPost.language}
                          value={newPost.codeSnippet}
                          onChange={(value) => setNewPost({...newPost, codeSnippet: value})}
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
