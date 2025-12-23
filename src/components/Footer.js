import React, { useState } from "react";
import axios from "axios";
import "../assets/css/Footer.css";
import logoSaleNoti from "../assets/img/logoSaleNoti.png";
import dmcaProtected from "../assets/img/dmcaProtected.png";
import spay from "../assets/img/spay.png";
import vnpay from "../assets/img/vnpay.png";
import cod from "../assets/img/cod.png";

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage("Vui lòng nhập email hợp lệ!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/newsletter/subscribe", { email });
      setMessage(response.data.message);
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi đăng ký, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer>
      <div className="footer-container">
        {/* Đăng ký nhận tin */}
        <div className="newsletter">
          <p>ĐĂNG KÝ NHẬN TIN</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="subscribe">
              <div className="input-wrapper">
                <i className="fa-light fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading}>
                <i className="fa fa-paper-plane"></i>
                {loading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </form>
          {message && <p className="newsletter-message">{message}</p>}
        </div>

        {/* Nội dung chính của Footer */}
        <div className="footer-content">
          {/* Cột Giới Thiệu */}
          <div className="footer-column">
            <h3>GIỚI THIỆU</h3>
            <p>160STORE - Chuỗi Phân Phối Thời Trang Nam Chuẩn Hiệu</p>
            <p className="phone">
              <i className="fa-light fa-mobile-screen-button"></i>
              <a href="tel:0522586725">0522586725</a>

            </p>
            <p className="contact">
              <i className="fa-light fa-envelope"></i>
              <a href="mailto:vmt7308@gmail.com">vmt7308@gmail.com</a>
            </p>
            <p className="time">
              <i className="fa-light fa-clock-nine"></i>
              Giờ mở cửa: 08:30 - 22:00
            </p>
            <p className="consultant">
              <i className="fa-light fa-headphones"></i>
              Nhân viên tư vấn phản hồi tin nhắn đến 24:00 (Mỗi ngày)
            </p>
            <div className="certificates">
              <img src={logoSaleNoti} alt="Bộ Công Thương" />
              <img src={dmcaProtected} alt="DMCA Protected" />
            </div>
          </div>

          {/* Cột Chính Sách */}
          <div className="footer-column">
            <h3>CHÍNH SÁCH</h3>
            <ul>
              <li>Hướng dẫn đặt hàng</li>
              <li className="toggle-policy" onClick={() => setIsOpen(!isOpen)}>
                Chính sách
                <i
                  className={`fa fa-chevron-${isOpen ? "up" : "down"} ${isOpen ? "rotate" : ""
                    }`}
                ></i>
              </li>
              {isOpen && (
                <ul className="policy-list">
                  <li>Chính Sách Ưu Đãi Sinh Nhật</li>
                  <li>Chính Sách Khách Hàng Thân Thiết</li>
                  <li>Chính Sách Giao Hàng</li>
                  <li>Chính Sách Bảo Mật</li>
                  <li>Chính Sách Đổi Hàng Và Bảo Hành</li>
                </ul>
              )}
            </ul>
          </div>

          {/* Cột Địa Chỉ Cửa Hàng */}
          <div className="footer-column">
            <h3>ĐỊA CHỈ CỬA HÀNG (22 CH)</h3>
            <p>
              <i className="fa-light fa-map-location-dot"></i>
              <strong>HỒ CHÍ MINH (10 CH)</strong>
              <br /> 2973 Tô Hiến Thành, Phường 13, Quận 10, TP Hồ Chí Minh
            </p>
            <p>
              <i className="fa-light fa-map-location-dot"></i>
              <strong>HÀ NỘI (2 CH)</strong>
              <br /> Số 26 phố Lê Đại Hành, Phường Lê Đại Hành, Quận Hai Bà
              Trưng, TP Hà Nội
            </p>
            <p>
              <i className="fa-light fa-map-location-dot"></i>
              <strong>CẦN THƠ (2 CH)</strong>
              <br /> Số 35 Trần Phú, Phường Cái Khế, Quận Ninh Kiều, TP Cần Thơ
            </p>
            <p>
              <i className="fa-light fa-map-location-dot"></i>
              <strong>ĐỒNG NAI (2 CH)</strong>
              <br /> 332 Đ. Lê Duẩn, Tân Chính, Thanh Khê, <br />
              Đà Nẵng -<span className="new">New</span>
            </p>
            <a href="/stores">XEM TẤT CẢ CỬA HÀNG</a>
          </div>

          {/* Cột Phương Thức Thanh Toán */}
          <div className="footer-column">
            <h3>PHƯƠNG THỨC THANH TOÁN</h3>
            <div className="payment-methods">
              <img src={spay} alt="PayPal" />
              <img src={vnpay} alt="VNPay" />
              <img src={cod} alt="COD" />
            </div>
          </div>
        </div>
      </div>
      {/* Bản quyền */}
      <div className="footer-bottom">Copyright @MINHTRUNG - HCMUS. All Rights Reserved.</div>
    </footer>
  );
};

export default Footer;
