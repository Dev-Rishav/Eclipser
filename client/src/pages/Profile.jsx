import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FaThLarge, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';


import { useUserProfile } from '../hooks/useUserProfile';
import { ProfileHeader } from '../components/newUI/ProfileHeader';
import { AchievementSection } from '../components/newUI/AchievementSection';
import { PostFeed } from '../components/newUI/PostFeed';

const Profile = () => {
  const location = useLocation();
  // Get userId from either NavLink state or a potential URL param as a fallback
  const { userId } = location.state || {}; 
  const { user: loggedInUser } = useSelector((state) => state.auth);
  
  // Use the custom hook to get all data, loading, and error states
  const { profile, posts, isFollowing, loading, error, setFollowStatus } = useUserProfile(userId);
  
  const [activeTab, setActiveTab] = useState('posts');
  
  const isOwnProfile = loggedInUser?._id === userId;
  
  // Filter achievements from all posts
  const achievements = posts?.filter(p => p.postType === 'achievement');
  // const achievements = "New Explorer"

  // Loading and Error States
  if (loading) {
    // You can use your detailed loading component here
    return <div className="min-h-screen bg-space-void flex items-center justify-center text-white">ACCESSING OPERATOR FILE...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-space-void flex items-center justify-center text-stellar-orange">{error}</div>;
  }
  
  const TABS = [
    { id: 'posts', label: 'Mission Reports', icon: FaThLarge, content: posts },
    // { id: 'achievements', label: 'Commendations', icon: FaTrophy, content: achievements },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-void via-space-dark to-space-void text-space-text p-6 relative">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        <ProfileHeader 
          user={profile} 
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowStatusChange={setFollowStatus}
        />

        {achievements?.length > 0 && (
          <AchievementSection badges={achievements} />
        )}
        
        {/* Tab Navigation */}
        <div className="border-b border-stellar-blue/20 flex items-center justify-start gap-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-2 font-mono uppercase text-sm transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-space-muted hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2"><tab.icon /> {tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-stellar-blue shadow-stellar-blue-glow"
                  layoutId="profileTabUnderline"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Display */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'posts' && <PostFeed posts={posts} />}
              {activeTab === 'achievements' && (
                 <div className="text-center py-16 text-space-muted font-mono">
                    This section can display achievements in more detail.
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;