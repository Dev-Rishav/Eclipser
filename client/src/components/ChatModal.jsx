import { useState, useEffect, useRef } from "react";
import { formatCosmicTime, generateUserAvatar } from "../utility/chatUtils";
import { useSelector } from "react-redux";
import { fetchChatHistory } from "../utility/fetchMessages";

import socket from "../config/socket";

export const ChatModal = ({ chat, onClose }) => {

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const bottomRef = useRef(null);
  // console.log('Chat:', chat);

  //chat History
  useEffect(() => {
    const fetchHistory = async () => {
      if (chat) {
        try {
          // Fetch full chat history
          const chatHistory = await fetchChatHistory(chat.user._id);

          if (chatHistory && Object.keys(chatHistory).length !== 0) {
            // console.log("Chat history:", chatHistory);
            setMessages(chatHistory); // Update the messages state
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };

    fetchHistory(); // Call the async function
  }, [chat]);

  useEffect(() => {
    if(!chat || !user?._id) return;

    // this is for acknowledgment
    socket.on("newPrivateMessage", (message) => {
      console.log("New message sent:", message);
    });

    socket.on("private_message", (message) => {
      console.log("New private message received:", message);
      if(message.receiverId === user._id){
        setMessages((prevMessages) => [
          message,
          ...prevMessages,
        ]);

      }
    })

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    const interval = setInterval(() => socket.emit("ping_server"), 5000); // heartbeat every 5s

    return () => {
      socket.off("disconnect");
      socket.off("newPrivateMessage");
      socket.off("private_message");
      socket.off("connect_error");
      clearInterval(interval);
    };
  },[chat, user._id]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // onSubmit({
      //   senderId: user._id,
      //   content: newMessage,
      //   receiverId: chat?.user._id,
      // });
      //api
      socket.emit("privateMessage", {
        senderId: user._id,
        receiverId: chat?.user._id,
        content: newMessage,
      });
      // console.log("Message sent:", {

      setNewMessage("");
    }
  };

  const orderedMessages = [...messages].reverse();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);





  return (
    <div className="space-y-4 h-[70vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-nebula/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full ${
                generateUserAvatar(chat?.user.username).gradient
              } 
              flex items-center justify-center text-cosmic font-bold`}
            >
              {generateUserAvatar(chat?.user.username).initials}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full 
              border-2 border-cosmic ${
                isOnline ? "bg-green-400" : "bg-gray-500"
              }`}
            />
          </div>
          <h3 className="text-corona font-orbitron">
            {chat?.user.username || "New Chat"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-stardust hover:text-supernova"
        >
          ✕
        </button>
      </div>

      {/* Chat messages */}
      <div className="overflow-y-auto flex flex-col cosmic-scroll pb-4">
        {orderedMessages.length > 0 ? (
          orderedMessages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.senderId === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  msg.senderId === user._id
                    ? "bg-gradient-to-br from-nebula to-supernova text-cosmic"
                    : "bg-stellar border border-nebula/30 text-white"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatCosmicTime(msg.sentAt)}
                </p>
              </div>
              <div ref={bottomRef} />
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-stardust/60">
            No subspace messages detected
          </div>
        )}
      </div>


      {/* Message input */}
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
