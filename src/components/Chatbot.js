import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../assets/css/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là chatbot của 160store. Bạn muốn tìm sản phẩm hay cần hỗ trợ gì? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn đến backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Thêm tin nhắn người dùng vào danh sách
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    try {
      const response = await axios.post("http://localhost:5000/api/chatbot", {
        message: input,
      });
      const botReply = response.data.reply;

      // Thêm phản hồi của bot
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Có lỗi xảy ra, vui lòng thử lại!" },
      ]);
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
              <div
                key={index}
                className={`chatbot-message ${
                  msg.sender === "user" ? "user" : "bot"
                }`}
              >
                {msg.text}
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
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
