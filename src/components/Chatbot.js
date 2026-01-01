// Component FE cho chatbot (giao diện chat bubble).
// Ghi chú: Gửi message + userId (từ localStorage auth) đến BE. Hiển thị responses.

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../assets/css/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Xin chào! Tôi là Chatbot AI của 160store. Bạn cần hỗ trợ gì ạ? 😊" }]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State mới để kiểm soát loading
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    // Hiển thị loading indicator ngay lập tức
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "bot", text: "typing" }]); // Message tạm với text đặc biệt

    try {
      const response = await axios.post("http://localhost:5000/api/chatbot", { message: userMessage, userId: localStorage.getItem('userId') });

      // Xóa loading và thêm phản hồi thật
      setMessages((prev) => prev.filter(msg => msg.text !== "typing"));
      setMessages((prev) => [...prev, { sender: "bot", text: response.data.reply }]);
    } catch (error) {
      setMessages((prev) => prev.filter(msg => msg.text !== "typing"));
      setMessages((prev) => [...prev, { sender: "bot", text: "Lỗi, thử lại!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✖" : "💬"}
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text === "typing" ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..." 
              disabled={isLoading} // Disable input khi đang loading (tùy chọn)  
            />
            <button type="submit" disabled={isLoading}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
