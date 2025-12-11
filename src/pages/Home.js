import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../assets/css/Home.css";
import banner1 from "../assets/img/banner1.jpg";
import banner2 from "../assets/img/banner2.jpg";
import banner3 from "../assets/img/banner3.jpg";
import banner4 from "../assets/img/banner4.jpg";
import product1 from "../assets/img/product1.jpg";
import "../assets/font/font-awesome-pro-v6-6.2.0/css/all.min.css";

function Home() {
  const navigate = useNavigate();
  const banners = [banner1, banner2, banner3, banner4];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const timeoutRef = useRef(null);
  const contactRef = useRef(null);

  // Danh sách các hiệu ứng
  const effectTypes = ["falling-leaves", "shooting-stars", "bubbles"];
  // Tạo map hiệu ứng cho các category
  const generateCategoryEffects = (categories) => {
    const categoryEffects = {};

    categories.forEach((category) => {
      // Chọn ngẫu nhiên một hiệu ứng
      const randomEffect =
        effectTypes[Math.floor(Math.random() * effectTypes.length)];
      categoryEffects[category.CategoryID] = randomEffect;
    });

    return categoryEffects;
  };
  // State lưu trữ hiệu ứng cho mỗi danh mục
  const [categoryEffects, setCategoryEffects] = useState({});

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

        // Tạo hiệu ứng ngẫu nhiên cho các danh mục
        const effects = generateCategoryEffects(catRes.data);
        setCategoryEffects(effects);

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
        //console.log("Categories:", catRes.data);
        //console.log("Products:", productsData);
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

  // Popup chi tiết sản phẩm product
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // State cho popup chi tiết sản phẩm
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const popupRef = useRef(null);

  // Add this function to handle quick view button click
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setSelectedColor(product.Color || "Xanh lá");
    setSelectedSize(product.Size || "S");
    setQuantity(1);
    setShowProductDetails(true);
  };

  // Hàm tăng số lượng
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Hàm giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Add this function to close the popup
  const closeProductDetails = () => {
    setShowProductDetails(false);
  };

  // Add this to the existing useEffect that handles the popup
  useEffect(() => {
    if (showProductDetails) {
      document.body.classList.add("popup-open");

      // ESC key listener
      const handleEscKey = (e) => {
        if (e.key === "Escape") {
          closeProductDetails();
        }
      };

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.body.classList.remove("popup-open");
        document.removeEventListener("keydown", handleEscKey);
      };
    } else {
      document.body.classList.remove("popup-open");
    }
  }, [showProductDetails]);

  // Colors for product options
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, color, size, quantity) => {
    // Create a temporary image element for animation
    const productImage = document.createElement("img");
    productImage.src = product.ImageURL ? `/${product.ImageURL}` : product1;
    productImage.style.position = "fixed"; // Use fixed positioning for better control
    productImage.style.width = "50px";
    productImage.style.height = "50px";
    productImage.style.zIndex = "1000";
    productImage.style.pointerEvents = "none"; // Prevent interaction with the image
    document.body.appendChild(productImage);

    // Get the position of the "Add to Cart" button and cart icon
    const addButton = document.querySelector(".add-to-cart-btn");
    const cartIcon = document.querySelector(".cart-button .fa-cart-shopping");

    if (!addButton || !cartIcon) {
      console.error("Add button or cart icon not found!");
      document.body.removeChild(productImage);
      return;
    }

    const addButtonRect = addButton.getBoundingClientRect();
    const cartIconRect = cartIcon.getBoundingClientRect();

    // Set initial position using fixed positioning
    productImage.style.left = `${
      addButtonRect.left + addButtonRect.width / 2 - 25
    }px`;
    productImage.style.top = `${
      addButtonRect.top + addButtonRect.height / 2 - 25
    }px`;

    // GSAP animation
    gsap.to(productImage, {
      x: cartIconRect.left - addButtonRect.left + cartIconRect.width / 2 - 25,
      y: cartIconRect.top - addButtonRect.top + cartIconRect.height / 2 - 25,
      scale: 0.3,
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(productImage);
        closeProductDetails(); // Close popup after animation
      },
    });

    // Update cart in localStorage
    const cartItem = {
      id: `${product.ProductID}-${color}-${size}`,
      productId: product.ProductID,
      image: product.ImageURL ? `/${product.ImageURL}` : product1,
      name: product.ProductName,
      color,
      size,
      quantity,
      price: product.Price,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === cartItem.id
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    // Dispatch custom event to notify Header of cart update
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Handler for product item click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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

            // Lấy hiệu ứng cho danh mục hiện tại
            const categoryEffect =
              categoryEffects[category.CategoryID] || "falling-leaves";

            return (
              <section
                key={category.CategoryID}
                id={sectionId}
                ref={(el) => (sectionRefs.current[sectionId] = el)}
                className="product-categories"
              >
                {/* Thêm khung bao quanh với màu trùng với product-tag */}
                <div
                  className="product-frame"
                  style={{ borderColor: categoryColor }}
                >
                  {/* Hiệu ứng ngẫu nhiên */}
                  <div className="effects-container">
                    <div className={`effect ${categoryEffect}`}></div>
                  </div>

                  <h2
                    className="category-title"
                    style={{
                      borderBottom: `2px solid ${categoryColor}`, // độ dày và màu
                      display: "inline-block", // để border bottom chỉ nằm dưới chữ
                      paddingBottom: "4px", // khoảng cách giữa chữ và gạch chân
                    }}
                  >
                    {category.CategoryName}
                  </h2>

                  <div className="product-grid">
                    {displayedProducts.length > 0 ? (
                      displayedProducts.map((product) => (
                        <div
                          key={product.ProductID}
                          className="product-item"
                          onClick={() => handleProductClick(product.ProductID)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="product-image-container">
                            <div
                              className="product-tag"
                              style={{ backgroundColor: categoryColor }}
                            >
                              {category.CategoryName}
                            </div>

                            <img
                              src={
                                product.ImageURL
                                  ? `/${product.ImageURL}`
                                  : product1
                              }
                              alt={product.ProductName}
                              className="product-image"
                              onError={handleImageError}
                            />
                            <button
                              className="quick-view-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering product-item click
                                handleQuickView(product);
                              }}
                            >
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
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Product Details Popup */}
      {showProductDetails && selectedProduct && (
        <div className="product-details-overlay" onClick={closeProductDetails}>
          <div
            className="product-details-popup"
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-popup" onClick={closeProductDetails}>
              ×
            </button>
            <div className="product-details-content">
              <div className="product-details-image">
                <img
                  src={
                    selectedProduct.ImageURL
                      ? `/${selectedProduct.ImageURL}`
                      : product1
                  }
                  alt={selectedProduct.ProductName}
                  onError={handleImageError}
                />
              </div>
              <div className="product-details-info">
                <h2>{selectedProduct.ProductName}</h2>
                <p className="product-details-price">
                  {Number(selectedProduct.Price).toLocaleString()}₫
                </p>
                <p className="product-details-sku">
                  SKU:{" "}
                  {selectedProduct.SKU || `SEID${selectedProduct.ProductID}-01`}
                </p>

                <div className="product-details-options">
                  <div className="color-option">
                    <p>Màu sắc: {selectedColor}</p>
                    <div className="color-selector">
                      {productColors.map((color) => (
                        <div
                          key={color.id}
                          className={`color-circle ${
                            selectedColor === color.name ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color.code }}
                          onClick={() => setSelectedColor(color.name)}
                        >
                          {selectedColor === color.name && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-option">
                    <p>Kích thước: {selectedSize}</p>
                    <div className="size-selector">
                      {["S", "M", "L", "XL"].map((size) => (
                        <div
                          key={size}
                          className={`size-box ${
                            selectedSize === size ? "selected" : ""
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="quantity-selector">
                  <button
                    className="quantity-btn decrease"
                    onClick={decreaseQuantity}
                  >
                    −
                  </button>
                  <input type="text" value={quantity} readOnly />
                  <button
                    className="quantity-btn increase"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() =>
                    addToCart(
                      selectedProduct,
                      selectedColor,
                      selectedSize,
                      quantity
                    )
                  }
                >
                  Thêm vào giỏ
                </button>

                <div className="product-details-description">
                  <p>
                    {selectedProduct.Descriptions ||
                      "Sản phẩm thời trang cao cấp, thiết kế hiện đại với chất liệu vải cao cấp, form dáng thoải mái. Phù hợp cho nhiều dịp khác nhau."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <a href="tel:0522586725" className="contact-option phone">
              📞 Gọi ngay
            </a>
            <a
              href="https://www.facebook.com/vmt7308"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-option facebook"
            >
              📘 Facebook
            </a>
            <a
              href="https://zalo.me/0522586725"
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
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      )}
      <Chatbot />
      <Footer />
    </div>
  );
}

export default Home;
