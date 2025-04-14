import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  // Product colors
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

  // Available sizes
  const availableSizes = ["S", "M", "L", "XL"];

  // State for cart items, loaded from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    return savedCart;
  });

  // State for selected voucher
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Voucher options
  const vouchers = [
    {
      code: "VOUCHER10K",
      name: "VOUCHER 10% TỐI ĐA 10K",
      discount: 10000,
      minOrder: 100000,
    },
    {
      code: "VOUCHER50K",
      name: "VOUCHER 50K ĐƠN TỪ 699K",
      discount: 50000,
      minOrder: 699000,
    },
    {
      code: "VOUCHER80K",
      name: "VOUCHER 80K ĐƠN TỪ 999K",
      discount: 80000,
      minOrder: 999000,
    },
  ];

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  // Calculate subtotal (Đơn giá)
  // "Đơn giá" là lấy giá 1 sản phẩm * số lượng
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate discount based on selected voucher
  // Nếu có chọn mã giảm giá thì sẽ được giảm theo voucher đã chọn
  const discount = selectedVoucher ? selectedVoucher.discount : 0;

  // Calculate shipping free
  // Nếu "Đơn giá" lớn hơn hoặc bằng 399000, sẽ hiển thị "Free ship đơn từ 399k", ngược lại sẽ tính phí 30000
  const shippingFee = subtotal >= 399000 ? 0 : 30000;

  // Calculate total (Thành tiền)
  // Thành tiền = (Giá của 1 sản phẩm * số lượng) - voucher giảm giá (nếu thỏa điều kiện) - 30k phí vận chuyển nếu thỏa điều kiện
  const total = subtotal - discount + shippingFee;

  // Update quantity
  const updateQuantity = (id, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  // Update color
  const updateColor = (id, color) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, color } : item))
    );
  };

  // Update size
  const updateSize = (id, size) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, size } : item))
    );
  };

  // Remove item
  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Handle voucher selection
  const handleVoucherChange = (e) => {
    const selectedCode = e.target.value;
    const voucher = vouchers.find((v) => v.code === selectedCode);
    setSelectedVoucher(voucher || null);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // Navigate to checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> / <span>Giỏ hàng</span>
        </div>

        <div className="cart-content">
          {/* Cart Details */}
          <div className="cart-details">
            <h2>Giỏ hàng</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <div className="item-options">
                      <div className="color-option">
                        <p>Màu sắc:</p>
                        <div className="color-selector">
                          {productColors.map((color) => (
                            <div
                              key={color.id}
                              className={`color-circle ${
                                item.color === color.name ? "selected" : ""
                              }`}
                              style={{ backgroundColor: color.code }}
                              onClick={() => updateColor(item.id, color.name)}
                              title={color.name}
                            >
                              {item.color === color.name && (
                                <span className="checkmark">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="size-option">
                        <p>Kích thước:</p>
                        <div className="size-selector">
                          {availableSizes.map((size) => (
                            <div
                              key={size}
                              className={`size-box ${
                                item.size === size ? "selected" : ""
                              }`}
                              onClick={() => updateSize(item.id, size)}
                            >
                              {size}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="quantity-option">
                        <p>Số lượng:</p>
                        <div className="quantity-selector">
                          <button
                            className="quantity-btn decrease"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <input type="text" value={item.quantity} readOnly />
                          <button
                            className="quantity-btn increase"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="item-subtotal">
                      Đơn giá: {formatPrice(item.price)} {" x "} {item.quantity} {" = "} {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => removeItem(item.id)}
                  >
                    <i className="fa-solid fa-trash"> DELETE</i>
                  </button>
                </div>
              ))
            ) : (
              <p className="cart-empty">Giỏ hàng của bạn đang trống!</p>
            )}
          </div>

          {/* Order Info */}
          <div className="order-info">
            <h2>Thông tin đơn hàng</h2>
            <div className="voucher-section">
              <label>Chọn mã giảm giá:</label>
              <select
                value={selectedVoucher?.code || ""}
                onChange={handleVoucherChange}
              >
                <option value="">Không sử dụng mã</option>
                {vouchers.map((voucher) => (
                  <option
                    key={voucher.code}
                    value={voucher.code}
                    disabled={subtotal < voucher.minOrder}
                  >
                    {voucher.name}
                  </option>
                ))}
              </select>
            </div>
            <p>
              Tạm tính: <span>{formatPrice(subtotal)}</span>
            </p>
            <p>
              Giảm giá: <span>{formatPrice(discount)}</span>
            </p>
            <p>
              Phí ship:{" "}
              <span>
                {subtotal >= 399000
                  ? "Free ship đơn từ 399k"
                  : formatPrice(shippingFee)}
              </span>
            </p>
            <p className="total">
              Thành tiền: <b>{formatPrice(total)}</b>
            </p>
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
