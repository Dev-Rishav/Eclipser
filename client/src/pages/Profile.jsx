import React, { useEffect, useState } from "react";
import { TrophyIcon, ChatBubbleLeftIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

const Profile = () => {
  const [user, setUser] = useState(null); // State to store the user object

  // Fetch user data from local storage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
        <div className="bg-gradient-to-br from-stellar to-cosmic rounded-2xl p-8 border border-nebula/30 backdrop-blur-lg">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-nebula to-supernova flex items-center justify-center text-3xl font-bold text-cosmic">
              {user.username.toUpperCase()}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl text-corona font-orbitron">{user.username}</h1>
              <div className="flex items-center gap-4 text-stardust/80">
                <span>{user.email}</span>
                <span className="text-sm bg-nebula/20 px-3 py-1 rounded-full">{user.role}</span>
              </div>
              <p className="text-stardust/60 text-sm">
                Joined the cosmos on {new Date(user.joined).toLocaleDateString()}
              </p>
            </div>
          </div>
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

            {user.achievements == null && (
              <div className="text-center py-8 text-stardust/60">
                No achievements yet. Start contributing to the cosmos!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;