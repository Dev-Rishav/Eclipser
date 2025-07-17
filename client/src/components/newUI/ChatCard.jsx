import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchRecentChats } from '../../utility/chatUtils';
import { AnimatedModal } from '../AnimateModal';
import { ChatModal } from '../ChatModal';

const ChatCard = () => {
  const [chats, setChats] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  // Load recent chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const recentChats = await fetchRecentChats();
        setChats(recentChats.chats || []);
      } catch (error) {
        console.error("Error loading chats:", error);
        setChats([]);
      }
    };
    loadChats();
  }, []);

  // Load more chats
  const loadMoreChats = async () => {
    if (!hasMoreChats) return;

    try {
      const response = await fetchRecentChats(page + 1);
      setChats((prev) => [...prev, ...(response.chats || [])]);
      setPage((prev) => prev + 1);
      setHasMoreChats((response.chats || []).length > 0);
    } catch (error) {
      console.error("Error loading more chats:", error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setIsChatOpen(true);
  };

  const handleStartNewChat = () => {
    setSelectedChat(null);
    setIsChatOpen(true);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-eclipse-surface dark:bg-space-darker rounded-lg p-5 border border-stellar-blue/50 shadow-stellar-blue-glow w-full max-w-xs animate-edge-glow"
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-eclipse-text-light dark:text-space-text flex items-center gap-2">
            <div className="w-2 h-2 bg-stellar-blue rounded-full animate-stellar-pulse"></div>
            Stellar Communications
          </h2>
          <div className="text-xs text-stellar-blue font-mono">#7B68EE</div>
        </div>
        
        <div className="space-y-3">
          {/* New Chat Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartNewChat}
            className="w-full p-3 rounded-lg border border-stellar-blue/50 bg-eclipse-border/30 dark:bg-space-void/50 hover:bg-stellar-blue/10 text-stellar-blue text-sm font-medium transition-all duration-300 hover:shadow-stellar-blue-glow"
          >
            + Start New Conversation
          </motion.button>

          {/* Recent Chats */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-eclipse-muted-light dark:text-space-text/80">Recent Chats</h3>
            {chats.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {chats.slice(0, 5).map((chat, index) => (
                  <motion.div
                    key={chat.id || index}
                    whileHover={{ scale: 1.02 }}
                    className="p-2 rounded-lg border border-stellar-blue/20 bg-eclipse-border/20 dark:bg-space-void/30 hover:bg-stellar-blue/5 cursor-pointer transition-all duration-300"
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-stellar-blue to-stellar-orange flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {chat.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-eclipse-text-light dark:text-space-text truncate">
                          {chat.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-eclipse-muted-light dark:text-space-text/60 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-stellar-orange flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {chats.length > 5 && hasMoreChats && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={loadMoreChats}
                    className="w-full p-2 text-xs text-stellar-blue hover:text-stellar-orange transition-colors"
                  >
                    Load More Chats...
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-stellar-blue/20 bg-eclipse-border/20 dark:bg-space-void/30">
                <p className="text-xs text-eclipse-muted-light dark:text-space-text/60 text-center">
                  No recent conversations
                </p>
              </div>
            )}
          </div>

          {/* Chat Status */}
          <div className="p-2 rounded-lg border border-stellar-green/30 bg-eclipse-border/20 dark:bg-space-void/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-green rounded-full animate-stellar-pulse"></div>
              <span className="text-xs text-stellar-green">Online & Ready</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Modal */}
      <AnimatedModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      >
        <ChatModal
          selectedChat={selectedChat}
          onClose={() => setIsChatOpen(false)}
        />
      </AnimatedModal>
    </>
  );
};

export default ChatCard;
