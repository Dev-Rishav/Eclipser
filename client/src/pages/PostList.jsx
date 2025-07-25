import { PostCard } from "../components/PostCard";
import { useSelector } from "react-redux";
import { usePostLoader } from "../hooks/usePostLoader";
import { useEffect, useState } from "react";
import { clearPostCache } from "../utility/storageCleaner";
import LoadingPage from "../components/LoadingPage";
import { QuickAccess } from "../components/QuickAccess";
import { LiveActivity } from "../components/LiveActivity";
import { ChatPreview } from "../components/ChatPreview";
import { createPost } from "../utility/createPost";
import { SubscribedTopicsList } from "../components/SubscribedTopicsList";



const PostList = () => {
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true); // State to control loading screen
  const user = useSelector((state) => state.auth.user);
  const token = user.token;
  const {
    posts,
    setPosts,
    isLoading,
    lastPostRef,
    allPostsExhausted,
    livePosts,
    setLivePosts,
  } = usePostLoader(user);



  useEffect(() => {
    setTimeout(() => {
      setShowLoadingAnimation(false); // Hide loading screen after 3 seconds
    }, 3000);
  }, [showLoadingAnimation]);

    // onreload clear posts cache
  useEffect(() => {
    if (!user || !token) return;
    clearPostCache();
  }, [user, token]);

  if(showLoadingAnimation){
    return (
      <>
      <LoadingPage/ >
        </>
      
    );
  }

  return (
    <div className="post-list px-4">
        <div>
      {(user?.subscribedTopics || []).length === 0 && (
        <div className="bg-blue-100 text-blue-800 p-2 rounded mb-3 text-center">
          You're not subscribed to any topics. Showing general posts instead.
        </div>
      )}
      </div>
      {livePosts.length > 0 && (
        <div
          className="text-center bg-yellow-200 text-black p-2 rounded mb-4 cursor-pointer hover:bg-yellow-300 transition"
          onClick={() => {
            setPosts((prev) => [...livePosts, ...prev]);
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

      {isLoading && (
        <p className="text-center text-gray-500 mt-4">Loading...</p>
      )}

      {allPostsExhausted && (
        <p className="text-center text-green-600 font-bold mt-4">
          🌌 You have reached the end of the universe!
        </p>
      )}
    </div>
  );
};

export default PostList;
