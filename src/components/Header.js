import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/img/logo.png";
import "../assets/css/Header.css";
import "../assets/font/font-awesome-pro-v6-6.2.0//css/all.min.css";

function Header({ scrollToSection }) {
  // Header luôn luôn hiển thị
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Nhận prop scrollToSection từ Home.js
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const navigate = useNavigate(); // Hook để điều hướng trang đến Cart (Chi tiết giỏ hàng)

  // Đóng popup khi click bên ngoài
  const closePopup = () => {
    setShowLogin(false);
    setShowCart(false);
  };

  // Chức năng popup đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Thử lại!");
    }
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
        <div className="search-bar">
          <input type="text" placeholder="Bạn đang tìm gì..." />
          <button>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        {/* Icon điều hướng */}
        <div className="header-icons header-buttons">
          <Link to="/stores">
            <i className="fa-light fa-map-location-dot"></i>
            <p>Cửa hàng</p>
          </Link>
          <button
            className="header-btn"
            onClick={() => setShowLogin(!showLogin)}
          >
            <i className="fa-light fa-user"></i>
            Đăng nhập
          </button>
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
        <ul>
          <li>
            <div className="menu-item">
              <span className="badge">New</span>
              <Link onClick={() => scrollToSection("new-arrivals")}>
                HÀNG MỚI MỖI NGÀY
              </Link>
              <span className="underline"></span>
            </div>
          </li>
          <li>
            <div className="menu-item">
              <Link onClick={() => scrollToSection("best-sellers")}>
                HÀNG BÁN CHẠY
              </Link>
              <span className="underline"></span>
            </div>
          </li>
          <li>
            <div className="menu-item">
              <Link onClick={() => scrollToSection("summer-collection")}>
                TỦ ĐỒ MÙA HÈ
              </Link>
              <span className="underline"></span>
            </div>
          </li>
          <li>
            <div className="menu-item">
              <Link onClick={() => scrollToSection("combo-mix-match")}>
                COMBO MIX & MATCH
              </Link>
              <span className="underline"></span>
            </div>
          </li>
        </ul>
      </nav>

      {/* Lớp phủ mờ khi hiển thị popup */}
      {(showLogin || showCart) && (
        <div className="overlay" onClick={closePopup}></div>
      )}

      {/* Popup Đăng nhập */}
      {(showLogin || showCart) && (
        <div className="overlay" onClick={closePopup}></div>
      )}
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
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
    </header>
  );
}

export default Header;
