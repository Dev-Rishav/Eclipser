import React from "react";
import { formatCosmicTime, generateUserAvatar } from "../utility/chatUtils";

export const ChatPreview = ({
  chats = [],
  title = "Quantum Comm",
  onStartNewChat = () => {},
}) => {
  return (
    <div className="p-4 bg-gradient-to-br from-cosmic to-stellar rounded-lg border border-nebula/30 backdrop-blur-lg">
      <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
        {title}
      </h3>

      <div className="space-y-4 mb-4">
        {chats.map((chat) => {
          const avatar = generateUserAvatar(
            chat.user.username,
            chat.isOnline
          );

          return (
            <div
              key={chat.id}
              className="flex items-start p-3 rounded-lg border border-nebula/30 hover:bg-nebula/10 transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative mr-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${avatar.gradient} text-cosmic font-bold`}
                >
                  {avatar.initials}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cosmic ${avatar.statusColor}`}
                />
              </div>

              {/* Chat Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-stardust text-sm font-medium truncate">
                    {chat.user.username}
                  </h4>
                  {chat.unread > 0 && (
                    <span className="bg-supernova text-cosmic px-2 rounded-full text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-stardust/80 text-sm truncate mt-1">
                  {chat.lastMessage.content}
                </p>
                <span className="text-nebula text-xs font-mono mt-1 block">
                  {formatCosmicTime(chat.lastMessage.sentAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onStartNewChat}
        className="w-full py-2 px-4 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-corona"
      >
        Initiate Wormhole Chat
      </button>
    </div>
  );
};
