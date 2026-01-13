// Component FE cho chatbot (giao diện chat bubble) - Hỗ trợ audio từ backend. Bổ sung: Play audio từ response.data.audioUrl nếu có.
// Ghi chú: Gửi message + userId (từ localStorage auth) đến BE. Hiển thị responses.

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../assets/css/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Xin chào! Tôi là Chatbot AI của 160store. Bạn cần hỗ trợ gì ạ? 😊" }]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State mới để kiểm soát loading
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'vi-VN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage({ preventDefault: () => {} });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setMessages((prev) => [...prev, { sender: "bot", text: "Lỗi nhận diện giọng nói, thử lại!" }]);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

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
      const botReply = response.data.reply;
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);

      // Play audio nếu backend trả về audioUrl (bằng tiếng Việt chất lượng cao từ TTS(Text to Speech))
      if (response.data.audioUrl) {
        const audio = new Audio(response.data.audioUrl);
        audio.play().catch(err => console.error("Audio play error:", err));
      }
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
              disabled={isLoading || isRecording} // Disable input khi đang loading (tùy chọn)
            />
            <button type="button" className={`voice-button ${isRecording ? 'recording' : ''}`} onClick={toggleRecording} disabled={isLoading}>
              {isRecording ? "🛑" : "🎤"}
            </button>
            <button type="submit" disabled={isLoading || isRecording}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
