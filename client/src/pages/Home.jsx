// HomePage.jsx
import React, { useEffect, useState } from "react";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { PostCard } from "../components/PostCard";
import FeedControlBar from "../components/FeedControlBar";
import { fetchPosts } from "../utility/fetchPost";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [posts, setPosts] = useState([]);
  let localStorageUpdate = false; //think of better approach to handle this
  const [scrollY, setScrollY] = useState(0);



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
      localStorageUpdate = true;
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

  //local storage needed to be updated whenever posts state are updated
  useEffect(() => {
    if (localStorageUpdate) {
      localStorage.setItem("cachedPosts", JSON.stringify(posts));
      console.log("WRITING LOCAL storage");
      localStorageUpdate=false;
    }
  }, [posts]);

  return (
   <div className="min-h-screen bg-gradient-to-br from-cosmic to-stellar">
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
          <div className="space-y-4 mt-4">
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
      </div>
    </div>
  );
};

export default HomePage;
