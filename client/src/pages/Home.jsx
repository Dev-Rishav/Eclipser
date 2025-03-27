// HomePage.jsx
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { PostCard } from "../components/PostCard";
import FeedControlBar from '../components/FeedControlBar';
import { fetchPosts } from "../utility/fetchPost";

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");

  // // Sample data
  // const posts = [
  //   {
  //     id: 1,
  //     topic: "WebDev",
  //     content: "How to optimize React rendering?",
  //     author: "JohnDoe",
  //     votes: 45,
  //     answers: 12,
  //     time: "2h",
  //   },
  //   // ... more posts
  // ];

  const [posts, setPosts] = useState([]);

  //! [TODO]: fetching old posts from local storage, refactor logic to fetch new posts from backend
  //in backend too, its serving from redis cache, while the new posts are created 
  useEffect(() => {
    const getPosts = async () => {
      const data=await fetchPosts();
      setPosts(data);
    };
    getPosts();
  }, []);
  

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
