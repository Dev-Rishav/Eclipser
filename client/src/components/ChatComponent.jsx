import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const ChatComponent = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
      stompClient.subscribe(`/user/${username}/queue/messages`, (msg) => {
        const receivedMessage = JSON.parse(msg.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });
    setStompClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [username]);

  const sendMessage = () => {
    if (stompClient && message.trim()) {
      const chatMessage = {
        sender: username,
        receiver: 'receiverUsername', // Replace with the actual receiver's username
        content: message,
      };
      stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
      setMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.content} <em>{msg.timestamp}</em>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;