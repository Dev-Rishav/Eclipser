import { useEffect, useState, useCallback } from "react";
import {
  TrophyIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { FaEdit } from "react-icons/fa";
import { fetchPostsByUser } from "../utility/fetchPostsByUser";
import { PostCard } from "../components/PostCard";
import { useLocation} from "react-router-dom";
import { API_CONFIG } from "../config/api";
import Followers from "../assets/icons/Friends.svg"; 
import Follwing from "../assets/icons/notFriends.svg";
import { useDispatch, useSelector } from "react-redux";
import {follow,unfollow} from "../utility/updateFollower"
import toast from "react-hot-toast";
import {getFollowStatus} from "../utility/getFollowStatus"
import FeedControlBar from "../components/FeedControlBar";
import { AnimatedModal } from "../components/AnimateModal";
import { ChatModal } from "../components/ChatModal";

const Profile = () => {
  //? the only reason I am passing props but not using state is this component is used in multiple places to populate multiple users.
  const location= useLocation();
  console.log("Profile.jsx: location.state:", location.state);
  const { userId } = location.state || {};
  console.log("Profile.jsx: userId:", userId);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPost, setUserPost] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isFollowing, setIsFollowing] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("All");
  const [badges, setBadges] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const author=useSelector((state)=>state.auth.user);
  const authorId=useSelector((state) => state.auth.user._id); //this the user Id that is stored in redux store
  const dispatch=useDispatch();

  // console.log("userId from location state:", userId);
  

  //load the follow state
  useEffect(()=>{
    const fetchFollowStatus=async()=>{
      try {
        const res=await getFollowStatus(userId);
        if(res!=null)
          toast.success("follow status fetched successfully!");
        console.log(res,"res");
        
        setIsFollowing(res);
      } catch (error) {
        console.error("error fetching follow status ",error);
        toast.error("error fetching follow status ");
      }
    }
    fetchFollowStatus();
  },[userId]);


  //handle author identification
  useEffect(() => {
    if(authorId===userId){
      setIsAuthor(true);
      setIsOwnProfile(true);
    } else{
      setIsAuthor(false);
      setIsOwnProfile(false);
    }
  },[userId,authorId]);

  //to load user from local storage
  useEffect(() => {
    if (userId!=null && userId !== undefined) {
      const storedUser = localStorage.getItem("user");
      console.log("Profile.jsx: localStorage.getItem('user'):", storedUser);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("Profile.jsx: Parsed userData from localStorage:", userData);
        setUser(userData);
        setNewUsername(userData.username);
      } else {
        console.warn("Profile.jsx: No user found in localStorage.");
      }
    } else {
      const fetchUser = async () => {
        try {
          console.log("Profile.jsx: Fetching user from API for userId:", userId);
          const response = await fetch(
            `${API_CONFIG.BASE_URL}/api/users/getUser/${userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          console.log("Profile.jsx: API response status:", response.status);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          console.log("Profile.jsx: API response data:", data);
          setUser(data);
          setNewUsername(data.username);
        } catch (error) {
          console.error("Profile.jsx: Error fetching user data:", error);
        }
      };
      fetchUser();
    }
  }, [userId]);

  //function to fetch user posts
  const fetchUserPosts = useCallback(async () => {
    if (!user?._id) {
      console.warn("Profile.jsx: fetchUserPosts called but user._id is missing. user:", user);
      return;
    }
    try {
      console.log("Profile.jsx: Fetching posts for user._id:", user._id);
      const fetchedPosts = await fetchPostsByUser(user._id);

      if (fetchedPosts) {
        setUserPost(fetchedPosts);
        setPosts(fetchedPosts); // Also set the posts state for the feed display
        console.log("Profile.jsx: User posts fetched successfully:", fetchedPosts);
      } else {
        console.warn("Profile.jsx: No posts returned for user._id:", user._id);
      }
    } catch (error) {
      console.error("Profile.jsx: Error fetching user posts:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user, fetchUserPosts]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }
      if (newUsername !== user.username) {
        formData.append("username", newUsername);
      }

      // Call your update API endpoint
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/user/profile/${user._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Updated successfully", result);
      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }

      const updatedUser = result.user;

      // Update local storage and state
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Update error:", error);
      // Add error handling UI here
    }
    setLoading(false);
  };

  //handle follow/unfollow
  const handleFollow = async () => {
    if(isFollowing == null){
      toast.error("APIs are working, slow down!")
      return;
    }
    const followerId = authorId;
    const followingId = userId;
  
    if (!followerId || !followingId) {
      toast.error("Invalid user IDs. Please try again.");
      return;
    }
  
    try {
      if (isFollowing) {
        // Unfollow user
        await unfollow(followerId, followingId);
        setIsFollowing(false);
        toast.success("User unfollowed successfully!");
        const updatedCount=user.followerCount-1;
        setUser({...user,followerCount:updatedCount});
        //update the redux user
        dispatch({
          type:"UPDATE_FOLLOWING_COUNT",
          payload:{followingCount:author.followerCount-1}
        })
        //dispatch is broken

      } else {
        // Follow user
        await follow(followerId, followingId);
        setIsFollowing(true);
        toast.success("User followed successfully!");
        const updatedCount=user.followerCount+1;
        setUser({...user,followerCount:updatedCount});
        dispatch({
          type:"UPDATE_FOLLOWING_COUNT",
          payload:{followingCount:author.followerCount+1}
        })
      }
    } catch (error) {
      console.error("Error in follow/unfollow operation:", error);
      toast.error("Failed to update follow status. Please try again.");
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await handleUpdateProfile();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle follow toggle
  const handleFollowToggle = () => {
    handleFollow();
  };

  // Handle chat modal
  const handleChatClick = () => {
    setIsChatModalOpen(true);
  };

  const handleChatCloseModal = () => {
    setIsChatModalOpen(false);
  };

  // Handle feed control changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Add logic to filter posts based on newFilter if needed
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    // Add logic to sort posts based on newSort if needed
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-space-void via-space-dark to-space-void flex items-center justify-center relative overflow-hidden">
        {/* Aerospace Loading Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/10 via-transparent to-stellar-purple/10"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-blue/50 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-purple/50 to-transparent animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-6 relative">
          {/* Profile Loading Indicator */}
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-stellar-orange/30 border-t-stellar-orange mx-auto shadow-stellar-orange-glow"></div>
            <div className="absolute inset-4 animate-spin rounded-full h-12 w-12 border-2 border-stellar-purple/30 border-t-stellar-purple shadow-stellar-purple-glow" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <p className="text-stellar-orange text-xl font-bold uppercase tracking-wider animate-pulse">
              ACCESSING OPERATOR FILE
            </p>
            <p className="text-space-muted text-sm font-mono">
              Decrypting profile data...
            </p>
          </div>
          
          {/* System Status Indicators */}
          <div className="flex justify-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-green rounded-full animate-pulse shadow-stellar-green-glow"></div>
              <span className="text-xs text-space-muted font-mono">AUTH</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-blue rounded-full animate-pulse shadow-stellar-blue-glow"></div>
              <span className="text-xs text-space-muted font-mono">DATA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-orange rounded-full animate-pulse shadow-stellar-orange-glow"></div>
              <span className="text-xs text-space-muted font-mono">SYNC</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-void via-space-dark to-space-void text-space-text p-6 relative overflow-hidden">
      {/* Aerospace Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-stellar-orange/5 via-transparent to-stellar-purple/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-orange/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-purple/50 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Operator Profile Header - Mission Control Style */}
        <div className="bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 rounded-2xl p-8 border-2 border-stellar-orange/30 backdrop-blur-xl relative shadow-stellar-orange-glow overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255, 69, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 69, 0, 0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Status Indicator */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-stellar-green rounded-full animate-pulse shadow-stellar-green-glow z-10"></div>
          
          {/* Control Panel */}
          <div className="absolute top-4 right-4 flex gap-3 z-10">
            {isAuthor ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-3 bg-gradient-to-r from-stellar-blue/20 to-stellar-purple/20 text-stellar-blue border-2 border-stellar-blue/50 rounded-lg hover:bg-gradient-to-r hover:from-stellar-blue/30 hover:to-stellar-purple/30 hover:border-stellar-blue/70 transition-all duration-300 shadow-stellar-blue-glow"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleFollow()}
                className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 border-2 ${
                  isFollowing 
                    ? 'border-stellar-orange/50 bg-stellar-orange/10 text-stellar-orange hover:border-stellar-orange/70 hover:bg-stellar-orange/20 shadow-stellar-orange-glow' 
                    : 'bg-gradient-to-r from-stellar-blue/20 to-stellar-purple/20 text-stellar-blue border-stellar-blue/50 hover:from-stellar-blue/30 hover:to-stellar-purple/30 hover:border-stellar-blue/70 shadow-stellar-blue-glow'
                }`}
              >
                {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
              </button>
            )}
          </div>
        
          
          {/* Operator Identity Panel */}
          <div className="relative">
            <div className="flex items-center gap-8 mb-6">
              <div className="relative">
                {user.profilePic?.length !== 0 ? (
                  <img
                    src={user.profilePic}
                    alt="Operator Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-stellar-orange/50 shadow-stellar-orange-glow"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-stellar-orange to-stellar-blue flex items-center justify-center text-4xl font-bold text-white shadow-stellar-orange-glow border-4 border-stellar-orange/30">
                    {user.username[0].toUpperCase()}
                  </div>
                )}

                {/* Status Ring */}
                <div className="absolute -inset-2 rounded-full border-2 border-stellar-green/30 animate-pulse"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-stellar-green rounded-full border-4 border-space-dark flex items-center justify-center shadow-stellar-green-glow">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>

                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="hidden"
                      id="profilePicInput"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="bg-stellar-orange text-white px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-stellar-orange/80 transition-colors shadow-stellar-orange-glow font-bold border-2 border-stellar-orange/50"
                    >
                      {selectedFile ? "FILE READY" : "UPLOAD"}
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-4 flex-1">
                {/* Operator Identification */}
                <div className="space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-4xl bg-space-darker/50 border-2 border-stellar-orange/30 text-space-text px-4 py-2 rounded-lg outline-none focus:border-stellar-orange/70 font-bold uppercase tracking-wide backdrop-blur-sm"
                    />
                  ) : (
                    <h1 className="text-4xl text-space-text font-bold uppercase tracking-wide">
                      <span className="text-stellar-orange">OPERATOR:</span> {user.username}
                    </h1>
                  )}

                  <div className="flex items-center gap-6 text-space-muted font-mono">
                    <div className="flex items-center gap-2 px-3 py-1 bg-space-darker/50 rounded border border-stellar-blue/30">
                      <span className="w-2 h-2 bg-stellar-blue rounded-full animate-pulse"></span>
                      <span className="text-sm uppercase">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-space-darker/50 rounded border border-stellar-purple/30">
                      <span className="w-2 h-2 bg-stellar-purple rounded-full animate-pulse"></span>
                      <span className="text-sm uppercase font-bold">
                        {user.achievements == null ? 0 : user.achievements} MISSIONS COMPLETE
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-space-muted text-sm font-mono uppercase tracking-wider">
                    <span className="text-stellar-orange">ENLISTED:</span> {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Command Status Display */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-space-darker/50 rounded-lg p-4 border border-stellar-green/30 shadow-stellar-green-glow">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 opacity-80" alt="Followers" src={Followers}/>
                      <div>
                        <div className="text-2xl font-bold text-stellar-green font-mono">{user.followerCount || 0}</div>
                        <div className="text-xs text-space-muted uppercase tracking-wider font-mono">FOLLOWERS</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-space-darker/50 rounded-lg p-4 border border-stellar-blue/30 shadow-stellar-blue-glow">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 opacity-80" src={Follwing} alt="Following"/>
                      <div>
                        <div className="text-2xl font-bold text-stellar-blue font-mono">{user.followingCount || 0}</div>
                        <div className="text-xs text-space-muted uppercase tracking-wider font-mono">FOLLOWING</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Control Actions */}
            <div className="flex items-center gap-4 justify-end">
              {isOwnProfile ? (
                isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className="px-6 py-3 bg-gradient-to-r from-stellar-green to-stellar-blue text-white font-bold rounded-lg hover:scale-105 transition-all shadow-stellar-green-glow border-2 border-stellar-green/30 uppercase tracking-wide"
                    >
                      {isUpdating ? "UPDATING..." : "CONFIRM CHANGES"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:scale-105 transition-all shadow-red-glow border-2 border-red-500/30 uppercase tracking-wide"
                    >
                      ABORT
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-stellar-orange to-stellar-purple text-white font-bold rounded-lg hover:scale-105 transition-all shadow-stellar-orange-glow border-2 border-stellar-orange/30 uppercase tracking-wide"
                  >
                    MODIFY PROFILE
                  </button>
                )
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowing || isUnfollowing}
                    className={`px-6 py-3 font-bold rounded-lg hover:scale-105 transition-all border-2 uppercase tracking-wide ${
                      user.isFollowing
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-glow border-red-500/30"
                        : "bg-gradient-to-r from-stellar-green to-stellar-blue text-white shadow-stellar-green-glow border-stellar-green/30"
                    }`}
                  >
                    {isFollowing || isUnfollowing
                      ? "PROCESSING..."
                      : user.isFollowing
                      ? "UNFOLLOW"
                      : "FOLLOW"}
                  </button>
                  <button
                    onClick={handleChatClick}
                    className="px-6 py-3 bg-gradient-to-r from-stellar-purple to-stellar-orange text-white font-bold rounded-lg hover:scale-105 transition-all shadow-stellar-purple-glow border-2 border-stellar-purple/30 uppercase tracking-wide"
                  >
                    COMLINK
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Display Panel */}
        {badges && badges.length > 0 && (
          <div className="bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 rounded-2xl p-8 border-2 border-stellar-orange/30 backdrop-blur-xl relative shadow-stellar-orange-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-1 bg-gradient-to-r from-stellar-orange to-transparent"></div>
              <h3 className="text-xl font-bold text-stellar-orange uppercase tracking-wide font-mono">
                COMMENDATIONS & HONORS
              </h3>
              <div className="flex-1 h-1 bg-gradient-to-r from-stellar-orange to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-space-darker/50 rounded-lg p-4 border border-stellar-orange/30 shadow-stellar-orange-glow hover:border-stellar-orange/60 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-stellar-orange to-stellar-purple rounded-full flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                      🏅
                    </div>
                    <h4 className="text-sm font-bold text-stellar-orange uppercase text-center font-mono">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-space-muted text-center font-mono">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Feed Control Panel */}
        <div className="bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 rounded-2xl p-8 border-2 border-stellar-blue/30 backdrop-blur-xl relative shadow-stellar-blue-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 bg-gradient-to-r from-stellar-blue to-transparent"></div>
            <h3 className="text-xl font-bold text-stellar-blue uppercase tracking-wide font-mono">
              MISSION REPORTS
            </h3>
            <div className="flex-1 h-1 bg-gradient-to-r from-stellar-blue to-transparent"></div>
          </div>

          <FeedControlBar 
            filter={filter} 
            sort={sort} 
            onFilterChange={handleFilterChange} 
            onSortChange={handleSortChange} 
          />

          {/* Mission Feed Display */}
          <div className="space-y-6 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-stellar-blue font-mono">
                  <div className="w-8 h-8 border-4 border-stellar-blue/30 border-t-stellar-blue rounded-full animate-spin"></div>
                  <span className="text-lg uppercase tracking-wide">LOADING MISSION DATA...</span>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-space-darker/50 rounded-lg p-8 border border-stellar-orange/30">
                  <div className="text-4xl mb-4">📡</div>
                  <h3 className="text-xl font-bold text-stellar-orange mb-2 uppercase font-mono">
                    NO TRANSMISSIONS DETECTED
                  </h3>
                  <p className="text-space-muted font-mono">
                    This operator has not filed any mission reports yet.
                  </p>
                </div>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </div>

      {/* Comlink Modal */}
      <AnimatedModal isOpen={isChatModalOpen} onClose={handleChatCloseModal}>
        <ChatModal user={user} onClose={handleChatCloseModal} />
      </AnimatedModal>
    </div>
  );
};

export default Profile;