import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import logo from "../assets/img/logo.png";
import "../assets/css/Header.css";
import "../assets/font/font-awesome-pro-v6-6.2.0//css/all.min.css";
import product1 from "../assets/img/product1.jpg";

function Header({ scrollToSection }) {
  // STATE VÀ LOGIC SCROLL-TO-TOP
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // State để kiểm tra trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // State kiểm soát việc ẩn / hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Header luôn luôn hiển thị
  const [isScrolled, setIsScrolled] = useState(false);

  // State cho chức năng tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const advancedSearchRef = useRef(null);

  // State cho Popup hiển thị chi tiết sản phẩm khi nháy vào kết quả tìm kiếm
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Ref for the product popup to handle click outside
  const productPopupRef = useRef(null);

  // State cho popup chi tiết sản phẩm
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("S"); // Size mặc định là S
  const [quantity, setQuantity] = useState(1);

  // Colors for product options (giống Home.js)
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

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

  // Cập nhật màu và size mặc định khi chọn sản phẩm
  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setSelectedColor(productColors[0].name); // Màu mặc định đầu tiên
    setSelectedSize("S"); // Size mặc định
    setQuantity(1);
    setShowProductPopup(true);
    setShowSearchResults(false);
  };

  // State lưu danh mục sản phẩm
  const [loading, setLoading] = useState(true);

  // Debounce tìm kiếm để tránh gọi API quá nhiều lần
  const searchTimeoutRef = useRef(null);

  // Ref cho dropdown tìm kiếm để xử lý click outside
  const searchResultsRef = useRef(null);

  // Nhận prop scrollToSection từ Home.js
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Chức năng popup đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Tham chiếu để xử lý click outside cho user menu
  const userMenuRef = useRef(null);

  // Hiển thị nút khi cuộn xuống
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
      // setShowContactOptions(false); // Đóng danh sách liên hệ khi cuộn chuột
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    checkLoginStatus();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Gộp useEffect xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Xử lý click outside cho user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }

      // Xử lý click outside để ẩn kết quả tìm kiếm
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }

      // Click outside to include the product popup cho chức năng tìm kiếm
      if (
        productPopupRef.current &&
        !productPopupRef.current.contains(event.target)
      ) {
        setShowProductPopup(false);
        setSelectedProduct(null);
      }

      // Xử lý click outside để ẩn bộ lộc tìm kiếm
      if (advancedSearchRef.current && !advancedSearchRef.current.contains(event.target)) {
        // Kiểm tra nếu không phải nút toggle thì mới đóng
        const toggleBtn = document.querySelector(".advanced-search-toggle");
        if (toggleBtn && !toggleBtn.contains(event.target)) {
          setShowAdvancedSearch(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showProductPopup) {
      document.body.classList.add("popup-open");

      const handleEscKey = (e) => {
        if (e.key === "Escape") {
          setShowProductPopup(false);
          setSelectedProduct(null);
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
  }, [showProductPopup]);

  // Kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);
      setCurrentUser(parsedUser);

      // Fallback nếu fullName bị mất
      const savedFullName = localStorage.getItem("userFullName");
      const displayName = parsedUser.fullName || parsedUser.FullName || savedFullName || "User";
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserMenu(false);

    // Chuyển hướng đến trang chủ sau khi đăng xuất
    navigate("/");

    // Thông báo đăng xuất thành công
    alert("Đăng xuất thành công!");
  };

  // Fetch danh mục sản phẩm từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Xử lý tìm kiếm khi người dùng nhập
  useEffect(() => {
    // Clear timeout cũ nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nếu từ khóa trống, ẩn kết quả
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Set timeout mới để debounce
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Tạo tham số query
        const params = new URLSearchParams();
        params.append("keyword", searchKeyword);

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }

        if (priceRange.min) {
          params.append("minPrice", priceRange.min);
        }

        if (priceRange.max) {
          params.append("maxPrice", priceRange.max);
        }

        const response = await axios.get(
          `http://localhost:5000/api/products/search?${params.toString()}`
        );
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Delay 500ms

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword, selectedCategory, priceRange.min, priceRange.max]);

  // Handle khi reset tìm kiếm
  const resetSearch = () => {
    setSearchKeyword("");
    setSelectedCategory(null);
    setPriceRange({ min: "", max: "" });
    setSearchResults([]);
    setShowSearchResults(false);
    setShowAdvancedSearch(false);
  };

  // Handle advanced search toggle
  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  // Handle submit tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // Thực hiện tìm kiếm ngay lập tức
      searchProducts();
    }
  };

  // Hàm tìm kiếm
  const searchProducts = async () => {
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.append("keyword", searchKeyword);

      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }

      if (priceRange.min) {
        params.append("minPrice", priceRange.min);
      }

      if (priceRange.max) {
        params.append("maxPrice", priceRange.max);
      }

      const response = await axios.get(
        `http://localhost:5000/api/products/search?${params.toString()}`
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Chuyển về trang chi tiết sản phẩm khi click vào sản phẩm
  const goToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
  };

  // Đóng popup khi click bên ngoài
  const closePopup = () => {
    setShowLogin(false);
    setShowCart(false);
    setShowUserMenu(false);
  };

  // Đăng nhập
  const handleLogin = async () => {
    setError("");
    try {
      // Gửi yêu cầu đăng nhập
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      // Lấy thông tin chi tiết user từ API
      const userDetailsResponse = await axios.get(
        `http://localhost:5000/api/users/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Kết hợp thông tin từ login và thông tin chi tiết
      const updatedUser = {
        ...user,
        ...userDetailsResponse.data,
        UserID: user.id, // Đảm bảo UserID được lưu
      };

      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Đóng popup và cập nhật trạng thái
      closePopup();
      setIsLoggedIn(true);
      setCurrentUser(updatedUser);

      // Reset form
      setEmail("");
      setPassword("");

      // Thông báo đăng nhập thành công
      alert("Đăng nhập thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Thử lại!");
    }
  };

  // Tự động chuyển đổi tên danh mục thành ID hợp lệ (thống nhất với Home.js)
  const getCategorySectionId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, "-") // Thay tất cả khoảng trắng liên tiếp bằng gạch ngang
      .replace(/[^\w\-]/g, ""); // Xóa ký tự đặc biệt
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const closeProductDetails = () => {
    setShowProductPopup(false);
  };

  // Cart state
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart);
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Calculate total amount
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total items
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

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
    productImage.style.left = `${addButtonRect.left + addButtonRect.width / 2 - 25
      }px`;
    productImage.style.top = `${addButtonRect.top + addButtonRect.height / 2 - 25
      }px`;

    // GSAP animation
    gsap.to(productImage, {
      x: cartIconRect.left - addButtonRect.left + cartIconRect.width / 2 - 25,
      y: cartIconRect.top - addButtonRect.top + cartIconRect.height / 2 - 200,
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

  return (
    <header className={`header-container ${isScrolled ? "scrolled" : ""}`}>
      {/* VOUCHER chạy từ phải sang trái */}
      <div className="voucher-container">
        <div className="voucher-scroll">
          <span>VOUCHER 10% TỐI ĐA 10K</span>
          <span>VOUCHER 50K ĐƠN TỪ 699K</span>
          <span>VOUCHER 80K ĐƠN TỪ 999K</span>
          <span>🚛 FREESHIP ĐƠN TỪ 399K</span>
        </div>
      </div>

      {/* Thanh header chính */}
      <div className="header-main">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="160Store" />
        </Link>

        {/* Thanh tìm kiếm */}
        <div className="search-container" ref={searchResultsRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Bạn đang tìm gì..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={resetSearch}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
              <button
                type="button"
                className="advanced-search-toggle"
                onClick={toggleAdvancedSearch}
              >
                <i
                  className={`fa-solid ${showAdvancedSearch ? "fa-chevron-up" : "fa-sliders"
                    }`}
                ></i>
              </button>
              <button type="submit">
                {isSearching ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-magnifying-glass"></i>
                )}
              </button>
            </div>

            {/* Advanced Search */}
            {showAdvancedSearch && (
              <div className="advanced-search-panel" ref={advancedSearchRef}>
                <div className="advanced-search">
                  <div className="search-filter">
                    <div className="filter-section">
                      <label>Danh mục:</label>
                      <select
                        value={selectedCategory || ""}
                        onChange={(e) =>
                          setSelectedCategory(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat.CategoryID} value={cat.CategoryID}>
                            {cat.CategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-section price-range">
                      <label>Khoảng giá:</label>
                      <div className="price-inputs">
                        <input
                          type="number"
                          placeholder="Từ"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange({ ...priceRange, min: e.target.value })
                          }
                        />
                        <span>-</span>
                        <input
                          type="number"
                          placeholder="Đến"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange({ ...priceRange, max: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="filter-actions">
                    <button
                      type="button"
                      className="reset-filters"
                      onClick={resetSearch}
                    >
                      Xóa bộ lọc
                    </button>
                    <button type="submit" className="apply-filters" onClick={() => { setShowAdvancedSearch(false); }} >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Kết quả tìm kiếm */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              <h3>Kết quả tìm kiếm ({searchResults.length})</h3>
              <ul>
                {searchResults.map((product) => (
                  <li
                    key={product.ProductID}
                    onClick={() => showProductDetails(product)}
                  >
                    <div className="product-image">
                      <img
                        src={product.ImageURL && (product.ImageURL.startsWith('/') ? product.ImageURL : `/${product.ImageURL}`)}
                        alt={product.ProductName}
                      />
                    </div>
                    <div className="product-info">
                      <h4>{product.ProductName}</h4>
                      <p className="product-price">
                        {formatPrice(product.Price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="view-all-results">
                <Link
                  to={`/search?keyword=${encodeURIComponent(searchKeyword)}`}
                >
                  Xem tất cả kết quả
                </Link>
              </div>
            </div>
          )}

          {/* Không có kết quả */}
          {showSearchResults &&
            searchKeyword &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="search-results no-results">
                <p>Không tìm thấy sản phẩm phù hợp!</p>
              </div>
            )}
        </div>

        {/* Icon điều hướng - UI thay đổi dựa trên trạng thái đăng nhập */}
        <div className="header-icons header-buttons">
          <Link to="/stores">
            <i className="fa-light fa-map-location-dot"></i>
            <p>Cửa hàng</p>
          </Link>

          {/* Kiểm tra trạng thái đăng nhập để hiển thị UI phù hợp */}
          {isLoggedIn ? (
            <div className="user-account">
              <button
                className="header-btn user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <i className="fa-light fa-user"></i>
                Hi, {currentUser?.fullName?.split(" ").pop() || localStorage.getItem("userFullName")?.split(" ").pop() || "User"}
              </button>
            </div>
          ) : (
            <button
              className="header-btn"
              onClick={() => setShowLogin(!showLogin)}
            >
              <i className="fa-light fa-user"></i>
              Đăng nhập
            </button>
          )}

          <button
            onClick={() => setShowCart(!showCart)}
            className="cart-button header-btn"
          >
            <i className="fa-light fa-cart-shopping"></i>
            <span className="cart-badge">{totalItems}</span>
            Giỏ hàng
          </button>
        </div>
      </div>

      {/* Menu danh mục sản phẩm */}
      <nav className="nav-menu">
        <ul className="category-list">
          {loading ? (
            <li>Đang tải danh mục...</li>
          ) : (
            categories.map((category) => (
              <li key={category.CategoryID}>
                <div className="menu-item">
                  {category.CategoryID === 1 && (
                    <span className="badge">New</span>
                  )}
                  <Link
                    to={`/#${getCategorySectionId(category.CategoryName)}`} // Chuyển về Home và Thêm hash để Home.js bắt và scroll
                    onClick={(e) => {
                      // Nếu đang ở trang chủ rồi thì mới scroll, còn không thì để navigate tự xử lý
                      if (window.location.pathname === "/") {
                        e.preventDefault(); // Ngăn navigate nếu đã ở trang chủ
                        scrollToSection(getCategorySectionId(category.CategoryName));
                      }
                      // Nếu đang ở trang khác → navigate đến "/#id", Home.js sẽ tự scroll
                    }}
                  >
                    {category.CategoryName}
                  </Link>
                  <span className="underline"></span>
                </div>
              </li>
            ))
          )}
        </ul>
      </nav>

      {/* Lớp phủ mờ khi hiển thị popup */}
      {(showLogin || showCart || showUserMenu || showProductPopup) && (
        <div className="overlay" onClick={closePopup}></div>
      )}

      {/* Popup Đăng nhập */}
      {showLogin && (
        <div className="popup-login login-popup">
          <div className="popup-arrow-login"></div>
          <div className="popup-content">
            <h2>ĐĂNG NHẬP TÀI KHOẢN</h2>
            <p>Nhập email và mật khẩu của bạn:</p>
            <input
              type="text"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            <button className="login-btn" onClick={handleLogin}>
              ĐĂNG NHẬP
            </button>
            <p>
              Khách hàng mới?{" "}
              <Link to="/register" className="link">
                Tạo tài khoản
              </Link>
            </p>
            <p>
              Quên mật khẩu?{" "}
              <Link to="/reset-password" className="link">
                Khôi phục mật khẩu
              </Link>
            </p>
            <button className="close-btn" onClick={closePopup}>
              <i className="fa-light fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Popup Giỏ hàng */}
      {showCart && (
        <div className="popup-cart cart-popup">
          <div className="popup-arrow-cart"></div>
          <div className="popup-content">
            <h2>GIỎ HÀNG</h2>
            {cart.length === 0 ? (
              <>
                <i className="fa-light fa-cart-shopping"></i>
                <p className="cart-empty">Hiện chưa có sản phẩm!</p>
              </>
            ) : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>Màu: {item.color}</p>
                      <p>Kích thước: {item.size}</p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Giá: {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total">
              <p className="total-amount">
                Tạm tính: <b>{formatPrice(totalAmount)}</b>
              </p>
            </div>
            <button className="cart-edit" onClick={() => navigate("/cart")}>
              CHỈNH SỬA GIỎ HÀNG
            </button>

            <button className="close-btn" onClick={closePopup}>
              <i className="fa-light fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Popup User Menu với ref và stopPropagation */}
      {showUserMenu && (
        <div className="popup-user user-popup" ref={userMenuRef}>
          <div className="popup-arrow-user"></div>
          <div className="popup-content">
            <h2>TÀI KHOẢN</h2>
            <div className="user-menu-items">
              <button
                className="user-menu-item"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện lan lên document
                  // console.log("Navigating to /account"); // Debug
                  navigate("/account?tab=account");
                  setShowUserMenu(false);
                  closePopup();
                }}
              >
                <i className="fa-light fa-user-circle"></i>
                <span>Tài khoản của tôi</span>
              </button>
              <button
                className="user-menu-item"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện lan lên document
                  // console.log("Navigating to /orders"); // Debug
                  navigate("/account?tab=orders");
                  setShowUserMenu(false);
                  closePopup();
                }}
              >
                <i className="fa-light fa-shopping-bag"></i>
                <span>Đơn hàng đã mua</span>
              </button>
              <button
                className="user-menu-item logout-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện lan lên document
                  // console.log("Logging out"); // Debug
                  handleLogout();
                }}
              >
                <i className="fa-light fa-sign-out"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
            <button className="close-btn" onClick={closePopup}>
              <i className="fa-light fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Product Details Popup */}
      {showProductPopup && selectedProduct && (
        <div
          className="product-details-overlay"
          onClick={() => setShowProductPopup(false)}
        >
          <div
            className="product-details-popup"
            ref={productPopupRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-popup"
              onClick={() => setShowProductPopup(false)}
            >
              ×
            </button>
            <div className="product-details-content">
              <div className="product-details-image">
                <img
                  src={
                    selectedProduct.ImageURL
                      ? (selectedProduct.ImageURL.startsWith('/') ? selectedProduct.ImageURL : `/${selectedProduct.ImageURL}`)
                      : product1
                  }
                  alt={selectedProduct.ProductName}
                />
              </div>
              <div className="product-details-info">
                <h2>{selectedProduct.ProductName}</h2>
                <p className="product-details-price">
                  {formatPrice(selectedProduct.Price)}
                </p>
                <p className="product-details-sku">
                  SKU: SEID
                  {selectedProduct.ProductID.toString().padStart(2, "0")}-01
                </p>

                <div className="product-details-options">
                  <div className="color-option">
                    <p>Màu sắc: {selectedColor}</p>
                    <div className="color-selector">
                      {productColors.map((color) => (
                        <div
                          key={color.id}
                          className={`color-circle ${selectedColor === color.name ? "selected" : ""
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
                          className={`size-box ${selectedSize === size ? "selected" : ""
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
      {/* Nút quay lại đầu trang */}
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      )}
    </header>
  );
}

export default Header;
