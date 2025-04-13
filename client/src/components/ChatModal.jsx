import { useState, useEffect } from 'react';
import { formatCosmicTime, generateUserAvatar } from '../utility/chatUtils';
import { useSelector } from 'react-redux';

export const ChatModal = ({ chat, onClose, onSubmit }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([chat?.lastMessage] || []);
  const [isOnline, setIsOnline] = useState(false);
  const {user}=useSelector((state) => state.auth);
    console.log('Chat:', chat);
    

  useEffect(() => {
    if (chat) {
      // Fetch full chat history
    //   fetchChatHistory(chat.id).then(setMessages);
    }
  }, [chat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSubmit({
        content: message,
        receiverId: chat?.user._id,
        timestamp: new Date().toISOString()
      });
      //api 
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-4 h-[70vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-nebula/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full ${generateUserAvatar(chat?.user.username).gradient} 
              flex items-center justify-center text-cosmic font-bold`}>
              {generateUserAvatar(chat?.user.username).initials}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full 
              border-2 border-cosmic ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>
          <h3 className="text-corona font-orbitron">
            {chat?.user.username || 'New Chat'}
          </h3>
        </div>
        <button onClick={onClose} className="text-stardust hover:text-supernova">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg ${
              msg.senderId === user._id 
                ? 'bg-gradient-to-br from-nebula to-supernova text-cosmic'
                : 'bg-stellar border border-nebula/30'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatCosmicTime(msg.sentAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-nebula/30 pt-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Transmit your message..."
            className="flex-1 bg-stellar border border-nebula/30 rounded-lg px-4 py-2 text-stardust"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg hover:brightness-110"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};