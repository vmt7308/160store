import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Checkout.css";
import cod from "../assets/img/cod.jpg";
import momo from "../assets/img/momo.jpg";

const Checkout = () => {
  const [user] = useState({
    avatar: "../assets/img/avatar.jpg",
    name: "Nguyễn Văn A",
    phone: "0987654321",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");

  const cartItems = [
    {
      id: 1,
      name: "Áo Thun Nam ICONDENIM Luminous",
      color: "Đen-0561",
      size: "S",
      price: 299000,
      quantity: 4
    },
  ];

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = subtotal >= 1000000 ? 80000 : 0;
  const shippingFee = 30000;
  const total = subtotal - discount + shippingFee;

  return (
    <>
      <Header />
      <div className="checkout-container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> / <a href="/cart">Giỏ hàng</a> /{" "}
          <span>Thông tin giao hàng</span>
        </div>

        <div className="checkout-content">
          {/* Thông tin giao hàng */}
          <div className="shipping-info">
            <h2>Thông tin giao hàng</h2>
            <div className="user-info">
              <img src={user.avatar} alt="User Avatar" />
              <p>{user.name}</p>
            </div>
            <span>Họ và tên</span>
            <input type="text" value={user.name} readOnly />
            <span>Số điện thoại</span>
            <input type="text" value={user.phone} readOnly />
            <span>Địa chỉ giao hàng</span>
            <input type="text" value={user.address} readOnly />
          </div>

          {/* Phương thức thanh toán */}
          <div className="payment-info">
            <h3>Nhập mã giảm giá (nếu có)</h3>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
            />
            <h3>Phương thức vận chuyển</h3>
            <select>
              <option value="Nhanh">Giao hàng nhanh - 30,000₫</option>
              <option value="Tiết kiệm">Giao hàng tiết kiệm - 20,000₫</option>
            </select>
            <h2>Phương thức thanh toán</h2>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <img src={cod} alt="COD" />
              Thanh toán khi giao hàng (COD)
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="MoMo"
                checked={paymentMethod === "MoMo"}
                onChange={() => setPaymentMethod("MoMo")}
              />
              <img src={momo} alt="MoMo" />
              Thanh toán qua ví MoMo
            </label>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="order-summary">
            <h2>Đơn hàng của bạn</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <p>
                    {item.color} / {item.size} x {item.quantity}
                  </p>
                </div>
                <p>{(item.price * item.quantity).toLocaleString("vi-VN")}₫</p>
              </div>
            ))}

            <p>
              Tạm tính: <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </p>
            <p>
              Giảm giá: <span>{discount.toLocaleString("vi-VN")}₫</span>
            </p>
            <p>
              Phí vận chuyển:{" "}
              <span>{shippingFee.toLocaleString("vi-VN")}₫</span>
            </p>
            <p className="total">
              Tổng cộng: <b>{total.toLocaleString("vi-VN")}₫</b>
            </p>

            <button className="complete-order-btn">Hoàn tất đơn hàng</button>
            <a href="/cart" className="back-to-cart">
              ← Quay lại giỏ hàng
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
