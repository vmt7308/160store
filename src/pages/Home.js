import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Home.css";
import banner1 from "../assets/img/banner1.jpg";
import banner2 from "../assets/img/banner2.jpg";
import banner3 from "../assets/img/banner3.jpg";
import banner4 from "../assets/img/banner4.jpg";

function Home() {
  const banners = [banner1, banner2, banner3, banner4];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const timeoutRef = useRef(null);
  const contactRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(nextSlide, 3000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [nextSlide, isPaused]);

  // Hiển thị nút khi cuộn xuống
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
      setShowContactOptions(false); // Đóng danh sách liên hệ khi cuộn chuột
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Đóng danh sách khi nhấn bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setShowContactOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <Header />
      <main>
        {/* Banner Slider */}
        <div
          className="banner-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button className="prev" onClick={prevSlide}>
            &#10094;
          </button>
          <img
            src={banners[currentIndex]}
            alt="Banner"
            className="banner-img"
          />
          <button className="next" onClick={nextSlide}>
            &#10095;
          </button>
          <div className="dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Danh mục sản phẩm */}
        
      </main>
      {/* Nút liên hệ */}
      <div className="contact-container" ref={contactRef}>
        <button
          className={`contact-btn ${showContactOptions ? "active" : ""}`}
          onClick={() => setShowContactOptions(!showContactOptions)}
        >
          📞
        </button>
        {showContactOptions && (
          <div className="contact-options">
            <a href="tel:0123456789" className="contact-option phone">
              📞 Gọi ngay
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-option facebook"
            >
              📘 Facebook
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-option zalo"
            >
              📱 Zalo
            </a>
          </div>
        )}
      </div>
      {/* Nút quay lại đầu trang */}
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ⬆
        </button>
      )}
      <Footer />
    </div>
  );
}

export default Home;
