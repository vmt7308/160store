import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Cart.css";

const Cart = () => {
  const navigate = useNavigate(); // Hook để điều hướng đến Checkout
  // Điều hướng đến trang Checkout khi nhấn vào nút
  const handleCheckout = () => {
    navigate("/checkout");
  };

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Áo Thun Nam ICONDENIM Luminous",
      color: "Đen-0561",
      size: "S",
      price: 299000,
      quantity: 4
    },
  ]);

  const [couponCode, setCouponCode] = useState("");

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = subtotal >= 1000000 ? 80000 : 0; // Giảm 80K nếu tổng > 1 triệu
  const total = subtotal - discount;

  // Xử lý tăng giảm số lượng sản phẩm
  const updateQuantity = (id, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> / <span>Giỏ hàng</span>
        </div>

        <div className="cart-content">
          {/* Chi tiết giỏ hàng */}
          <div className="cart-details">
            <h2>Giỏ hàng:</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>
                      {item.color} / {item.size}
                    </p>
                    <div className="quantity">
                      <button onClick={() => updateQuantity(item.id, -1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <p className="item-price">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                  <button
                    className="remove-item"
                    onClick={() => removeItem(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))
            ) : (
              <p className="cart-empty">Giỏ hàng của bạn đang trống</p>
            )}
          </div>

          {/* Thông tin đơn hàng */}
          <div className="order-info">
            <h2>Thông tin đơn hàng</h2>
            <p>
              Tạm tính: <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </p>
            <p>
              Giá giảm: <span>{discount.toLocaleString("vi-VN")}₫</span>
            </p>
            <p className="total">
              Tổng tiền: <b>{total.toLocaleString("vi-VN")}₫</b>
            </p>

            <h3>Ước tính thời gian giao hàng</h3>
            <select>
              <option>Chọn tỉnh/thành phố</option>
              <option>Hà Nội</option>
              <option>TP.HCM</option>
            </select>
            <select>
              <option>Chọn Quận/huyện</option>
              <option>Quận 1</option>
              <option>Quận 2</option>
            </select>

            <h3>Ghi chú đơn hàng</h3>
            <textarea placeholder="Ghi chú"></textarea>

            <h3>Nhập mã khuyến mãi (nếu có)</h3>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Nhập mã khuyến mãi"
            />

            <button className="checkout-btn" onClick={handleCheckout}>
              THANH TOÁN NGAY
            </button>
            <a href="/" className="continue-shopping">
              ← Tiếp tục mua hàng
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
