import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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

  // State quản lý trang hiện tại cho từng danh mục
  const [currentPages, setCurrentPages] = useState({});
  // Số sản phẩm trên một trang
  const productsPerPage = 5;

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

  // Tạo một mảng màu đẹp để random
  const colorPalette = useMemo(
    () => [
      "#FF6B6B", // đỏ
      "#4ECDC4", // xanh ngọc
      "#FF9F1C", // cam
      "#5D7599", // xanh dương
      "#7FBC8C", // xanh lá
      "#9B5DE5", // tím
      "#F15BB5", // hồng
      "#00BBF9", // xanh da trời
      "#FFC857", // vàng
      "#B76935", // nâu
      "#1A759F", // xanh nước biển
      "#06D6A0", // xanh mint
      "#EF476F", // đỏ hồng
      "#FFD166", // vàng nhạt
      "#118AB2", // xanh dương đậm
      "#6B8F71", // xanh olive
      "#8ECAE6", // xanh nhạt
      "#FB8500", // cam đậm
      "#023047", // xanh đen
      "#219EBC", // xanh coban
      "#BC4749", // đỏ gạch
      "#669BBC", // xanh thiên thanh
      "#FCBF49", // vàng nghệ
      "#EF233C", // đỏ tươi
      "#D90429", // đỏ đậm
    ],
    []
  );

  // Hàm tạo map màu cho các category
  const generateCategoryColors = (categories) => {
    // Sao chép mảng màu để tránh thay đổi mảng gốc
    const availableColors = [...colorPalette];
    const categoryColors = {};

    categories.forEach((category) => {
      // Nếu số lượng danh mục nhiều hơn bảng màu, tạo màu ngẫu nhiên
      let colorIndex;
      if (availableColors.length > 0) {
        // Chọn ngẫu nhiên một màu từ mảng có sẵn
        colorIndex = Math.floor(Math.random() * availableColors.length);
        categoryColors[category.CategoryID] = availableColors[colorIndex];
        // Loại bỏ màu đã sử dụng
        availableColors.splice(colorIndex, 1);
      } else {
        // Tạo màu RGB ngẫu nhiên nếu hết màu
        const r = Math.floor(Math.random() * 200) + 55; // Giới hạn từ 55-255 để tránh màu quá tối
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        categoryColors[category.CategoryID] = `rgb(${r}, ${g}, ${b})`;
      }
    });

    return categoryColors;
  };

  // State lưu trữ màu cho mỗi danh mục
  const [categoryColors, setCategoryColors] = useState({});

  const getCategorySectionId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, ""); // Loại bỏ ký tự đặc biệt
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
          "http://localhost:5000/api/list-categories"
        );
        setCategories(catRes.data);

        // Tạo bảng màu cho các danh mục
        const colors = generateCategoryColors(catRes.data);
        setCategoryColors(colors);

        const productsData = {};
        const initialPages = {};

        for (let category of catRes.data) {
          const res = await axios.get(
            `http://localhost:5000/api/list-products?categoryId=${category.CategoryID}`
          );
          productsData[category.CategoryID] = res.data;
          initialPages[category.CategoryID] = 0; // Trang đầu tiên là 0
        }

        setProductsByCategory(productsData);
        setCurrentPages(initialPages);
        console.log("Categories:", catRes.data);
        console.log("Products:", productsData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = product1; // Thay thế bằng ảnh mặc định
  };

  // Hàm chuyển đến trang tiếp theo của danh mục
  const nextPage = (categoryId) => {
    setCurrentPages((prevPages) => {
      const products = productsByCategory[categoryId] || [];
      const totalPages = Math.ceil(products.length / productsPerPage);
      const nextPage = (prevPages[categoryId] + 1) % totalPages;
      return { ...prevPages, [categoryId]: nextPage };
    });
  };

  // Hàm chuyển đến trang trước của danh mục
  const prevPage = (categoryId) => {
    setCurrentPages((prevPages) => {
      const products = productsByCategory[categoryId] || [];
      const totalPages = Math.ceil(products.length / productsPerPage);
      const prevPage =
        prevPages[categoryId] === 0
          ? totalPages - 1
          : prevPages[categoryId] - 1;
      return { ...prevPages, [categoryId]: prevPage };
    });
  };

  // Hàm chuyển đến trang cụ thể
  const goToPage = (categoryId, pageNumber) => {
    setCurrentPages((prevPages) => ({
      ...prevPages,
      [categoryId]: pageNumber,
    }));
  };

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
        <div className="category-product-section">
          {categories.map((category) => {
            const sectionId = getCategorySectionId(category.CategoryName);
            const allProducts = productsByCategory[category.CategoryID] || [];
            const currentPage = currentPages[category.CategoryID] || 0;
            const totalPages = Math.ceil(allProducts.length / productsPerPage);

            // Lấy chỉ 5 sản phẩm cho trang hiện tại
            const startIndex = currentPage * productsPerPage;
            const displayedProducts = allProducts.slice(
              startIndex,
              startIndex + productsPerPage
            );

            // Lấy màu cho danh mục hiện tại
            const categoryColor =
              categoryColors[category.CategoryID] || "#ffa500"; // Màu mặc định nếu không tìm thấy

            return (
              <section
                key={category.CategoryID}
                id={sectionId}
                ref={(el) => (sectionRefs.current[sectionId] = el)}
                className="product-categories"
              >
                <h2 className="category-title">{category.CategoryName}</h2>

                <div className="product-grid">
                  {displayedProducts.length > 0 ? (
                    displayedProducts.map((product) => (
                      <div key={product.ProductID} className="product-item">
                        <div className="product-image-container">
                          <div
                            className="product-tag"
                            style={{ backgroundColor: categoryColor }}
                          >
                            {category.CategoryName}
                          </div>

                          <img
                            src={product.ImageURL || product1}
                            alt={product.ProductName}
                            className="product-image"
                            onError={handleImageError}
                          />
                          <button className="quick-view-btn">
                            <span>🔍</span>
                          </button>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">
                            {product.ProductName}
                          </h3>
                          <p className="product-price">
                            {Number(product.Price).toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">Không có sản phẩm</div>
                  )}
                </div>

                {/* Phân trang - Chỉ hiển thị nếu có nhiều hơn 5 sản phẩm */}
                {allProducts.length > productsPerPage && (
                  <>
                    <div className="product-pagination">
                      {/* Nút Previous */}
                      <span
                        className="pagination-nav prev-page"
                        onClick={() => prevPage(category.CategoryID)}
                      >
                        &#10094;
                      </span>

                      {/* Hiển thị các dot cho từng trang */}
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <span
                          key={index}
                          className={`dot ${
                            index === currentPage ? "active" : ""
                          }`}
                          onClick={() => goToPage(category.CategoryID, index)}
                        ></span>
                      ))}

                      {/* Nút Next */}
                      <span
                        className="pagination-nav next-page"
                        onClick={() => nextPage(category.CategoryID)}
                      >
                        &#10095;
                      </span>
                    </div>
                  </>
                )}

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
