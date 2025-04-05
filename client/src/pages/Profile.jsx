import React, { useEffect, useState } from "react";
import {
  TrophyIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { FaEdit } from "react-icons/fa";
import { fetchPostsByUser } from "../utility/fetchPostsByUser";
import { PostCard } from "../components/PostCard";
import { useParams } from "react-router-dom";

const Profile = () => {
  const {userId} = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPost, setUserPost] = useState(null);

  //to load user from local storage
  useEffect(() => {
    if(!userId){
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setNewUsername(userData.username);
    }
  }else{
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/getUser/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
        setNewUsername(data.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUser();
  }
  }, [userId]);


  //function to fetch user posts
  const fetchUserPosts = async () => {
    try {
      const posts = await fetchPostsByUser(user._id);

      if (posts) {
        setUserPost(posts);
        console.log("User posts fetched successfully:", posts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };
  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

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
        `http://localhost:3000/api/user/profile/${user._id}`,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cosmic to-stellar">
        <p className="text-stardust/60 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic to-stellar p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-stellar to-cosmic rounded-2xl p-8 border border-nebula/30 backdrop-blur-lg relative">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 text-stardust hover:text-supernova transition-colors"
          >
            <FaEdit className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              {user.profilePic.length !== 0 ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-nebula/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-nebula to-supernova flex items-center justify-center text-3xl font-bold text-cosmic">
                  {user.username[0].toUpperCase()}
                </div>
              )}

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
                    className="bg-supernova text-cosmic px-3 py-1 rounded-full text-sm cursor-pointer hover:brightness-110"
                  >
                    {selectedFile ? selectedFile.name : "Change"}
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="text-3xl bg-stellar border-b border-nebula/50 text-corona font-orbitron"
                />
              ) : (
                <h1 className="text-3xl text-corona font-orbitron">
                  {user.username}
                </h1>
              )}

              <div className="flex items-center gap-4 text-stardust/80">
                <span>{user.email}</span>
                <span className="text-sm bg-nebula/20 px-3 py-1 rounded-full">
                  {user.achievements == null ?  0 : user.achievements} Achievements
                </span>
              </div>
              <p className="text-stardust/60 text-sm">
                Joined the cosmos on{" "}
                {new Date(user.joined).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg hover:brightness-110"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setNewUsername(user.username);
                }}
                className="px-4 py-2 bg-stellar border border-nebula/30 text-stardust rounded-lg hover:border-nebula/50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-6 bg-stellar rounded-xl border border-nebula/30 hover:border-nebula/50 transition-colors">
            <div className="flex items-center gap-4">
              <QuestionMarkCircleIcon className="w-8 h-8 text-supernova" />
              <div>
                <p className="text-stardust/60 text-sm">Queries Posted</p>
                <p className="text-2xl text-corona">
                  {/*userPost?.length ||  0*/}
                  {userPost
                    ? userPost.filter((post) => post.postType === "query")
                        .length
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-stellar rounded-xl border border-nebula/30 hover:border-nebula/50 transition-colors">
            <div className="flex items-center gap-4">
              <ChatBubbleLeftIcon className="w-8 h-8 text-supernova" />
              <div>
                <p className="text-stardust/60 text-sm">Discussions</p>
                <p className="text-2xl text-corona">
                  {userPost
                    ? userPost.filter((post) => post.postType === "discussion")
                        .length
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-stellar rounded-xl border border-nebula/30 hover:border-nebula/50 transition-colors">
            <div className="flex items-center gap-4">
              <TrophyIcon className="w-8 h-8 text-supernova" />
              <div>
                <p className="text-stardust/60 text-sm">Achievements</p>
                <p className="text-2xl text-corona">
                  {userPost
                    ? userPost.filter(
                        (post) => post.postType === "achievements"
                      ).length
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* all posts Section */}
        <div className="bg-gradient-to-br from-stellar/90 to-cosmic/90 rounded-2xl p-8 border-2 border-nebula/30 backdrop-blur-xl shadow-galaxy">
          <h2 className="text-3xl font-orbitron text-corona mb-8 flex items-center gap-3">
            <span className=" bg-supernova text-gray-800 px-4 py-2 rounded-lg text-lg font-bold">
              {userPost?.length || 0}
            </span>
            Cosmic Interactions
          </h2>

          <div className="grid gap-6">
            {userPost?.map((post) => (
              <PostCard key={post._id} post={post}/>
            ))}

            {(userPost == null || userPost?.length === 0) && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 text-6xl text-nebula/50">🌠</div>
                <p className="text-xl font-orbitron text-stardust/60 mb-2">
                  Silent Cosmos
                </p>
                <p className="text-stardust/40 max-w-md">
                  Your cosmic journey begins here - create your first post to
                  ignite interstellar discussions!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
