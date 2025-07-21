import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaCheck, FaTimes, FaPlus, FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { follow, unfollow } from '../../utility/updateFollower';
import { AnimatedModal } from '../AnimateModal';
import { ChatModal } from '../ChatModal';
import { useNavigate } from 'react-router-dom';

export const ProfileHeader = ({ user, isOwnProfile, isFollowing, onFollowStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const loggedInUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollow(loggedInUser._id, user._id);
        onFollowStatusChange(false);
        // Dispatch to update logged-in user's following count in Redux
        dispatch({ type: "UPDATE_FOLLOWING_COUNT", payload: { change: -1 }});
        toast.success(`Unfollowed ${user.username}`);
      } else {
        await follow(loggedInUser._id, user._id);
        onFollowStatusChange(true);
        dispatch({ type: "UPDATE_FOLLOWING_COUNT", payload: { change: 1 }});
        toast.success(`Now following ${user.username}`);
      }
    } catch (err) {
      toast.error("Operation failed. Please try again.");
    }
  };

  // Logic for editing profile can be added here
  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <>
      <div className="bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 rounded-2xl p-8 border-2 border-stellar-orange/30 backdrop-blur-xl shadow-stellar-orange-glow">
        <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-stellar-orange to-stellar-blue flex items-center justify-center text-4xl font-bold text-white shadow-stellar-orange-glow border-4 border-stellar-orange/30">
                  {user.profilePic ? (
                      <img src={user.profilePic} alt="Operator" className="w-full h-full rounded-full object-cover"/>
                  ) : (
                      user.username[0].toUpperCase()
                  )}
              </div>
            </div>
            {/* User Info & Stats */}
            <div className="flex-1 text-center md:text-left space-y-4">
                <h1 className="text-4xl text-space-text font-bold uppercase tracking-wide">
                    <span className="text-stellar-orange">OPERATOR:</span> {user.username}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-6 text-space-muted font-mono">
                  {/* Stats */}
                </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                {isOwnProfile ? (
                    <button onClick={handleEditToggle} className="px-6 py-3 bg-stellar-blue/20 text-stellar-blue rounded-lg font-bold uppercase"><FaEdit/></button>
                ) : (
                    <>
                        <button onClick={handleFollowToggle} className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wide border-2 ${isFollowing ? 'border-stellar-orange text-stellar-orange bg-stellar-orange/10' : 'border-stellar-blue text-stellar-blue bg-stellar-blue/10'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button onClick={() => navigate('/communications')} className="px-6 py-3 bg-stellar-purple/20 text-stellar-purple rounded-lg font-bold uppercase"><FaComments/></button>
                    </>
                )}
            </div>
        </div>
      </div>
      <AnimatedModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)}>
        <ChatModal user={user} onClose={() => setIsChatModalOpen(false)} />
      </AnimatedModal>
    </>
  );
};