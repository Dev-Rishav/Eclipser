import { useState, useEffect, useRef } from 'react';
import { formatCosmicTime, generateUserAvatar } from '../utility/chatUtils';
import { useSelector } from 'react-redux';
import { fetchChatHistory } from '../utility/fetchMessages';



export const ChatModal = ({ chat, onClose, onSubmit }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const {user}=useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
    console.log('Chat:', chat);
    

    useEffect(() => {
        const fetchHistory = async () => {
          if (chat) {
            try {
              // Fetch full chat history
              const chatHistory = await fetchChatHistory(chat.user._id);
      
              if (chatHistory && Object.keys(chatHistory).length !== 0) {
                console.log("Chat history:", chatHistory);
                setMessages(chatHistory); // Update the messages state
              }
            } catch (error) {
              console.error("Error fetching chat history:", error);
            }
          }
        };
      
        fetchHistory(); // Call the async function
      }, [chat]);

    //   setMessages(["hi"])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSubmit({
        content: newMessage,
        receiverId: chat?.user._id,
        timestamp: new Date().toISOString()
      });
      //api 
      setNewMessage('');
    }
  };

   // Auto-scroll to bottom on new messages
   useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.senderId === user._id ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={
        `max-w-[75%] p-3 rounded-lg text-sm'
        ${message.senderId === user._id
          ? 'bg-gradient-to-br from-orange-700 to-yellow-600 text-gray-200'
          : 'bg-stellar border border-nebula/30 text-stardust'}`
      }>
        <p>{message.content}</p>
        <time className="text-xs mt-1 opacity-70 block">
          {formatCosmicTime(message.sentAt)}
        </time>
      </div>
    </div>
  );

  // Chat header component
  const ChatHeader = () => {
    const avatar = generateUserAvatar(chat?.user?.username || 'NC');
    
    return (
      <div className="flex items-center justify-between border-b border-nebula/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full ${avatar.gradient} flex items-center justify-center text-cosmic font-bold`}>
              {avatar.initials}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cosmic ${
                isOnline ? 'bg-green-400' : 'bg-gray-500'
              }`} />
            </div>
          </div>
          <h3 className="text-corona font-orbitron">
            {chat?.user?.username || 'New Cosmic Connection'}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-stardust hover:text-supernova transition-colors"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
    );
  };

  // Message input component
  const MessageInput = () => (
    <form onSubmit={handleSubmit} className="border-t border-nebula/30 pt-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Transmit through quantum channel..."
          className="flex-1 bg-stellar border border-nebula/30 rounded-lg px-4 py-2 text-stardust focus:outline-none focus:border-supernova/50"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-corona to-supernova text-cosmic rounded-lg hover:brightness-110 transition-all"
        >
          Warp Send
        </button>
      </div>
    </form>
  );

  return (
    <div className="cosmic-chat-container h-[90vh]   flex flex-col">
      <ChatHeader />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto flex flex-col-reverse cosmic-scroll pb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
        
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-stardust/60">
            No subspace messages detected
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

// CSS-in-JS for theme-specific styles
const styles = {
  cosmicScroll: `
    scrollbar-width: thin;
    scrollbar-color: var(--nebula) transparent;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--nebula);
      border-radius: 3px;
    }
  `,
};