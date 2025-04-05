import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Home.css";
import banner1 from "../assets/img/banner1.jpg";
import banner2 from "../assets/img/banner2.jpg";
import banner3 from "../assets/img/banner3.jpg";
import banner4 from "../assets/img/banner4.jpg";
import product1 from "../assets/img/product1.jpg";

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

  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({});

  const getCategorySectionId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "");
  };

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(
          "http://localhost:5000/api/new-categories"
        );
        setCategories(catRes.data);

        const productsData = {};
        for (let category of catRes.data) {
          const res = await axios.get(
            `http://localhost:5000/api/new-products?categoryId=${category.CategoryID}`
          );
          productsData[category.CategoryID] = res.data;
        }
        setProductsByCategory(productsData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Header
        scrollToSection={scrollToSection}
        categories={categories}
        loading={loading}
      />
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
        {/* <section className="product-categories">
          <h2 className="category-title">HÀNG MỚI MỖI NGÀY</h2>
          <div className="product-grid">
            <div className="product-item">
              <div className="product-image-container">
                <div className="product-tag">Hàng Mới</div>
                <img
                  src={product1}
                  alt="Set Đồ Nam ICONDENIM"
                  className="product-image"
                />
                <button className="quick-view-btn">
                  <span>🔍</span>
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">
                  Set Đồ Nam ICONDENIM Rugby Football
                </h3>
                <p className="product-price">419,000₫</p>
              </div>
            </div>
            <div className="product-item">
              <div className="product-image-container">
                <div className="product-tag">Hàng Mới</div>
                <img
                  src={product1}
                  alt="Áo Polo Nam ICONDENIM"
                  className="product-image"
                />
                <button className="quick-view-btn">
                  <span>🔍</span>
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">
                  Áo Polo Nam ICONDENIM Horizontal Striped
                </h3>
                <p className="product-price">349,000₫</p>
              </div>
            </div>
            <div className="product-item">
              <div className="product-image-container">
                <div className="product-tag">Hàng Mới</div>
                <img
                  src={product1}
                  alt="Áo Thun Nam ICONDENIM"
                  className="product-image"
                />
                <button className="quick-view-btn">
                  <span>🔍</span>
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">
                  Áo Thun Nam ICONDENIM Edge Striped
                </h3>
                <p className="product-price">299,000₫</p>
              </div>
            </div>
            <div className="product-item">
              <div className="product-image-container">
                <div className="product-tag">Hàng Mới</div>
                <img
                  src={product1}
                  alt="Áo Somi Cuban Nam ICONDENIM"
                  className="product-image"
                />
                <button className="quick-view-btn">
                  <span>🔍</span>
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">
                  Áo Somi Cuban Nam ICONDENIM Nomadic Dreams
                </h3>
                <p className="product-price">349,000₫</p>
              </div>
            </div>
            <div className="product-item">
              <div className="product-image-container">
                <div className="product-tag">Siêu Nhẹ</div>
                <img
                  src={product1}
                  alt="Quần Jean Nam ICON105"
                  className="product-image"
                />
                <button className="quick-view-btn">
                  <span>🔍</span>
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">
                  Quần Jean Nam ICON105 Lightweight™ Straight Fit Dark Blue
                </h3>
                <p className="product-price">590,000₫</p>
              </div>
            </div>
          </div>
          <div className="product-pagination">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>
          <div className="view-all-container">
            <a href="/collections/hang-moi" className="view-all-btn">
              Xem tất cả »
            </a>
          </div>
        </section> */}

        <div className="category-product-section">
          {categories.map((category) => {
            const sectionId = getCategorySectionId(category.CategoryName);
            const products = productsByCategory[category.CategoryID] || [];

            return (
              <section
                key={category.CategoryID}
                id={sectionId}
                ref={(el) => (sectionRefs.current[sectionId] = el)}
                className="product-categories"
              >
                <h2 className="category-title">{category.CategoryName}</h2>

                <div className="product-grid">
                  {products.map((product) => (
                    <div key={product.ProductID} className="product-item">
                      <div className="product-image-container">
                        <div className="product-tag">Hàng Mới</div>
                        <img
                          src={product.ImageURL}
                          alt={product.ProductName}
                          className="product-image"
                        />
                        <button className="quick-view-btn">
                          <span>🔍</span>
                        </button>
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.ProductName}</h3>
                        <p className="product-price">
                          {Number(product.Price).toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="product-pagination">
                  <span className="dot active"></span>
                  <span className="dot"></span>
                </div>

                <div className="view-all-container">
                  <a
                    href={`/collections/${sectionId}`}
                    className="view-all-btn"
                  >
                    Xem tất cả »
                  </a>
                </div>
              </section>
            );
          })}
        </div>
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
