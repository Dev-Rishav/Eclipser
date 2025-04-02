import React, { useEffect, useState } from "react";
import { TrophyIcon, ChatBubbleLeftIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  //temp
  const token=JSON.stringify(localStorage.getItem("authToken"));
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setNewUsername(userData.username);
    }
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }
      if (newUsername !== user.username) {
        formData.append('username', newUsername);
      }

      // Call your update API endpoint
      const response = await fetch(`http://localhost:3000/api/user/profile/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result= await response.json();
      console.log("Updated successfully", result);
      if (!result.success) {
        throw new Error(result.error || 'Update failed');
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
                    {selectedFile ? selectedFile.name : 'Change'}
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
                <h1 className="text-3xl text-corona font-orbitron">{user.username}</h1>
              )}
              
              <div className="flex items-center gap-4 text-stardust/80">
                <span>{user.email}</span>
                <span className="text-sm bg-nebula/20 px-3 py-1 rounded-full">{user.role}</span>
              </div>
              <p className="text-stardust/60 text-sm">
                Joined the cosmos on {new Date(user.joined).toLocaleDateString()}
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
                {loading ? 'Saving...' : 'Save Changes'}
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
                <p className="text-2xl text-corona">{user.stats?.queries.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-stellar rounded-xl border border-nebula/30 hover:border-nebula/50 transition-colors">
            <div className="flex items-center gap-4">
              <ChatBubbleLeftIcon className="w-8 h-8 text-supernova" />
              <div>
                <p className="text-stardust/60 text-sm">Discussions</p>
                <p className="text-2xl text-corona">{user.stats?.discussions.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-stellar rounded-xl border border-nebula/30 hover:border-nebula/50 transition-colors">
            <div className="flex items-center gap-4">
              <TrophyIcon className="w-8 h-8 text-supernova" />
              <div>
                <p className="text-stardust/60 text-sm">Achievements</p>
                <p className="text-2xl text-corona">{user.stats?.achievements.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-gradient-to-br from-stellar to-cosmic rounded-2xl p-8 border border-nebula/30 backdrop-blur-lg">
          <h2 className="text-2xl text-corona font-orbitron mb-6">Cosmic Achievements</h2>
          <div className="grid gap-4">
            {user.achievements?.map((achievement, index) => (
              <div
                key={index}
                className="p-4 bg-stellar rounded-lg border border-nebula/30 hover:border-nebula/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-supernova">✦</span>
                  <div>
                    <h3 className="text-stardust font-semibold">{achievement.title}</h3>
                    <p className="text-stardust/60 text-sm">{achievement.description}</p>
                    <p className="text-stardust/40 text-xs mt-2">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}

            {user.achievements == null || user.achievements.length===0 && (
              <div className="text-center py-8 text-stardust/60">
                No achievements yet. Start contributing to the cosmos!
                
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-stardust/60">
      {token}
      </div>
    </div>
  );
};

export default Profile;