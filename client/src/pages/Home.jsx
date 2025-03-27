// HomePage.jsx
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
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
    <div className="home-container cosmic-bg">
      {/* <div className="eclipse-header">
        <div className="corona-effect"></div>
      </div> */}
      {/* not working */}

      <div className="main-grid">
        {/* Left Sidebar */}
        <div className="sidebar-left starmap-bg">
          <SubscribedTopicsList />
          <QuickAccess />
        </div>

        {/* Main Feed */}
        <div className="main-feed cosmic-feed">
          <FeedControlBar
            filter={selectedFilter}
            sort={selectedSort}
            onFilterChange={setSelectedFilter}
            onSortChange={setSelectedSort}
          />
          <div className="feed-content">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right nebula-bg">
          <LiveActivity />
          <ChatPreview />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
