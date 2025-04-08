import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/img/logo.png";
import "../assets/css/Header.css";
import "../assets/font/font-awesome-pro-v6-6.2.0//css/all.min.css";

function Header({ scrollToSection }) {
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

  // Kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    // Thông báo đăng xuất thành công
    alert("Đăng xuất thành công!");
  };

  // Xử lý click outside cho user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Xử lý click outside để ẩn kết quả tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      closePopup();

      // Cập nhật trạng thái đăng nhập
      setIsLoggedIn(true);
      setCurrentUser(response.data.user);

      // Reset form
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Thử lại!");
    }
  };

  // Tự động chuyển đổi tên danh mục thành ID hợp lệ
  const getCategorySectionId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/ /g, "-") // Thay dấu cách bằng "-"
      .replace(/[^\w-]+/g, ""); // Xóa ký tự đặc biệt
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
                  className={`fa-solid ${
                    showAdvancedSearch ? "fa-chevron-up" : "fa-sliders"
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
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Đến"
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
                  <button type="submit" className="apply-filters">
                    Áp dụng
                  </button>
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
                    onClick={() => goToProductDetail(product.ProductID)}
                  >
                    <div className="product-image">
                      <img src={product.imageUrl} alt={product.ProductName} />
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
            <div className="user-account" ref={userMenuRef}>
              <button
                className="header-btn user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <i className="fa-light fa-user"></i>
                Hi, {currentUser?.fullName?.split(" ").pop() || "User"}
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
            <span className="cart-badge">0</span>
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
                    onClick={() =>
                      scrollToSection(
                        getCategorySectionId(category.CategoryName)
                      )
                    }
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
      {(showLogin || showCart || showUserMenu) && (
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
            <i className="fa-light fa-cart-shopping"></i>
            <p className="cart-empty">Hiện chưa có sản phẩm</p>
            <p className="cart-discount">
              Bạn được giảm đến 10% tối đa 10K, mua thêm 699,000₫ nữa!
            </p>
            <div className="cart-total">
              <p>
                Tạm tính: <b>0₫</b>
              </p>
              <p>
                Giảm giá: <b>0₫</b>
              </p>
              <p className="total-amount">
                Tổng tiền: <b>0₫</b>
              </p>
            </div>
            <button className="cart-edit" onClick={() => navigate("/cart")}>
              CHỈNH SỬA GIỎ HÀNG
            </button>
            <button className="cart-checkout">THANH TOÁN</button>
            <button className="close-btn" onClick={closePopup}>
              <i className="fa-light fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Popup User Menu */}
      {showUserMenu && (
        <div className="popup-user user-popup">
          <div className="popup-arrow-user"></div>
          <div className="popup-content">
            <h2>TÀI KHOẢN</h2>
            <div className="user-menu-items">
              <Link
                to="/account"
                className="user-menu-item"
                onClick={closePopup}
              >
                <i className="fa-light fa-user-circle"></i>
                <span>Tài khoản của tôi</span>
              </Link>
              <Link
                to="/orders"
                className="user-menu-item"
                onClick={closePopup}
              >
                <i className="fa-light fa-shopping-bag"></i>
                <span>Đơn hàng đã mua</span>
              </Link>
              <button
                className="user-menu-item logout-btn"
                onClick={handleLogout}
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
    </header>
  );
}

export default Header;
