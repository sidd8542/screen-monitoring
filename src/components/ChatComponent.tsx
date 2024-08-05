// ChatComponent.tsx
import React, { useState, useEffect, useRef } from "react";

interface Message {
  sender: string;
  content: string;
}

interface ChatProps {
  socket: WebSocket;
  userType: "panelist" | "admin";
  sessionId: string;
}

const ChatComponent: React.FC<ChatProps> = ({ socket, userType, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.sessionId === sessionId && data.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };
  }, [socket, sessionId]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const message = { sender: userType, content: input };
      socket.send(JSON.stringify({ sessionId, type: "chat", message }));
      setMessages((prevMessages) => [...prevMessages, message]);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === userType ? "my-message" : "their-message"}>
            <strong>{msg.sender}: </strong>{msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
