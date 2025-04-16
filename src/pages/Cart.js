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
  const [selectedVoucher, setSelectedVoucher] = useState(() => {
    return JSON.parse(localStorage.getItem("selectedVoucher")) || null;
  });

  // State for order notes
  const [orderNotes, setOrderNotes] = useState(() => {
    return localStorage.getItem("orderNotes") || "";
  });

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

  // Lưu orderNotes vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("orderNotes", orderNotes);
  }, [orderNotes]);

  // Lưu selectedVoucher vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("selectedVoucher", JSON.stringify(selectedVoucher));
  }, [selectedVoucher]);

  // Update localStorage and validate voucher when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));

    // Validate voucher based on new subtotal
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    if (!cartItems.length) {
      setSelectedVoucher(null);
    } else if (selectedVoucher && subtotal < selectedVoucher.minOrder) {
      // Find the highest applicable voucher
      const validVoucher = vouchers
        .slice()
        .reverse()
        .find((voucher) => subtotal >= voucher.minOrder);
      setSelectedVoucher(validVoucher || null);
    }
  }, [cartItems, selectedVoucher]);

  // Calculate subtotal (Đơn giá)
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate discount based on selected voucher
  const discount = selectedVoucher ? selectedVoucher.discount : 0;

  // Calculate shipping fee
  const shippingFee = subtotal >= 399000 ? 0 : 30000;

  // Calculate total (Thành tiền)
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

  // Remove item with confirmation
  const removeItem = (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
    );
    if (confirmDelete) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
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

  // Handle checkout with login check
  const handleCheckout = () => {
    if (!cartItems.length) return; // Đảm bảo có ít nhất 1 sản phẩm

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    try {
      if (token && user && JSON.parse(user)) {
        // Người dùng đã đăng nhập, chuyển đến checkout để tiếp tục thanh toán
        navigate("/checkout");
      } else {
        // Người dùng chưa đăng nhập, hiển thị thông báo và chuyển đến login trước khi thanh toán
        alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
        navigate("/login?redirect=/checkout");
      }
    } catch (error) {
      // Lỗi đăng nhập không hợp lệ !!!
      alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
      navigate("/login?redirect=/checkout");
    }
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
                        <div className="cart-size-selector">
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
                      Đơn giá: {formatPrice(item.price)} {" x "} {item.quantity}{" "}
                      {" = "} {formatPrice(item.price * item.quantity)}
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
            <div className="notes-section">
              <label>Ghi chú đơn hàng:</label>
              <textarea
                placeholder="Nhập ghi chú (nếu có)"
                value={orderNotes}
                onChange={(e) => {
                  if (e.target.value.length <= 255) {
                    setOrderNotes(e.target.value);
                  }
                }}
                maxLength={255}
              ></textarea>
            </div>
            <div className="voucher-section">
              <label>Chọn mã giảm giá:</label>
              <select
                value={selectedVoucher?.code || ""}
                onChange={handleVoucherChange}
                disabled={!cartItems.length}
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
              Tạm tính:{" "}
              <span>{cartItems.length ? formatPrice(subtotal) : "0đ"}</span>
            </p>
            <p>
              Giảm giá:{" "}
              <span>{cartItems.length ? formatPrice(discount) : "0đ"}</span>
            </p>
            <p>
              Phí ship:{" "}
              <span>
                {cartItems.length
                  ? subtotal >= 399000
                    ? "Free ship đơn từ 399k"
                    : formatPrice(shippingFee)
                  : "0đ"}
              </span>
            </p>
            <p className="total">
              Thành tiền: <b>{cartItems.length ? formatPrice(total) : "0đ"}</b>
            </p>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={!cartItems.length}
            >
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
