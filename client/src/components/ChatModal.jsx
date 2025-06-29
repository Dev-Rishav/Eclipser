/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { formatCosmicTime, generateUserAvatar } from "../utility/chatUtils";
import { useSelector } from "react-redux";
import { fetchChatHistory } from "../utility/fetchMessages";
import socket from "../config/socket";

export const ChatModal = ({ chat = {}, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);
  const isFetchingRef = useRef(false); // prevent multiple fetches

  //fetch chat History
  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     if (chat) {
  //       try {
  //         const res = await fetchChatHistory(chat.user._id, page);
  //         if (res?.success) {
  //           const chatHistory = res?.messages;
  //           setMessages((prev) => [...prev, ...chatHistory]);
  //           setHasMore(res.pagination.hasMore);
  //           setPage((prev) => prev + 1);

  //         }
  //       } catch (error) {
  //         console.error("Error fetching chat history:", error);
  //       }
  //     }
  //   };

  //   fetchHistory(); // Call the async function
  // }, [chat]);

  //test
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chat || isFetchingRef.current) return;
  
      isFetchingRef.current = true;
      try {
        const res = await fetchChatHistory(chat.user._id, page);
        if (res?.success) {
          const chatHistory = res.messages;
  
          // If it's the first load, replace. Otherwise, append
          setMessages((prev) => (page === 1 ? chatHistory : [...prev, ...chatHistory]));
  
          // Set hasMore based on API's pagination info
          setHasMore(res.pagination.hasMore);
  
          // Increment page only if we got messages equal to our page limit
          // if (res.pagination.hasMore) {
          //   setPage((prev) => prev + 1);
          // }
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        isFetchingRef.current = false;
      }
    };
  
    fetchHistory();
  }, [chat, page]);


  // Scroll event listener to trigger fetching more messages
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 10 && hasMore && !isFetchingRef.current) {
        console.log("APi is preparing to fetch");
        
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore]);
  


  //! infinite scroll is fetching messages whenever scrolling happens4

  //event listeners
  useEffect(() => {
    if (!chat || !user?._id) return;

    // this is for acknowledgment
    socket.on("newPrivateMessage", (message) => {
      console.log("New message sent:", message);
    });

    socket.on("private_message", (message) => {
      console.log("New private message received:", message);
      if (message.receiverId === user._id) {
        setMessages((prevMessages) => [message, ...prevMessages]);
      }
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    const interval = setInterval(() => socket.emit("ping_server"), 50000); // heartbeat every 50s, over 60s the server will disconnect

    return () => {
      socket.off("disconnect");
      socket.off("newPrivateMessage");
      socket.off("private_message");
      socket.off("connect_error");
      clearInterval(interval);
    };
  }, [chat, user._id]);

  //handle send messages
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("privateMessage", {
        senderId: user._id,
        receiverId: chat?.user._id,
        content: newMessage,
      });
      setMessages((prevMessages) => [
        {
          senderId: user._id,
          receiverId: chat?.user._id,
          content: newMessage,
          sentAt: new Date().toISOString(),
          seen: false,
        },
        ...prevMessages,
      ]);
      setNewMessage("");
    }
  };

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
      <div ref={scrollRef} className=" overflow-y-auto h-full flex flex-col-reverse cosmic-scroll pb-4">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id || msg.sentAt}
              className={`flex pb-2 ${
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
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-stardust/60">
            No subspace messages detected !
          </div>
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="border-t border-nebula/30 pt-3 ">
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
