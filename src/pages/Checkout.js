import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Checkout.css";
import cod from "../assets/img/cod.jpg";
import momo from "../assets/img/momo.jpg";

const Checkout = () => {
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [cartItems, setCartItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [error, setError] = useState("");

  // Lấy thông tin giỏ hàng, ghi chú và voucher từ localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedNotes = localStorage.getItem("orderNotes") || "";
    const savedVoucher =
      JSON.parse(localStorage.getItem("selectedVoucher")) || null;
    setCartItems(savedCart);
    setOrderNotes(savedNotes);
    setSelectedVoucher(savedVoucher);

    // Lấy thông tin user từ localStorage
    const token = localStorage.getItem("token");
    let userData;
    try {
      userData = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
      console.error("Lỗi khi parse user từ localStorage:", err);
    }

    if (token && userData) {
      // Chấp nhận cả userData.UserID hoặc userData.id
      const userId = userData.UserID || userData.id;
      if (userId) {
        setUser(userData);
        // Lấy thông tin chi tiết từ DB
        fetchUserDetails(userId, token);
      } else {
        console.warn("userData không có UserID hoặc id:", userData);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=/checkout");
      }
    } else {
      navigate("/login?redirect=/checkout");
    }
  }, [navigate]);

  // Hàm lấy thông tin chi tiết user từ DB
  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedUserData = { ...user, ...response.data };
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
    } catch (err) {
      console.error("Lỗi khi lấy thông tin user:", err);
      setError("Không thể tải thông tin người dùng! Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login?redirect=/checkout");
    }
  };

  // Cập nhật thông tin user
  const [updatedUser, setUpdatedUser] = useState({
    FullName: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
  });

  useEffect(() => {
    if (user) {
      setUpdatedUser({
        FullName: user.FullName || "",
        Email: user.Email || "",
        PhoneNumber: user.PhoneNumber || "",
        Address: user.Address || "",
      });
    }
  }, [user]);

  const handleUpdateUser = async () => {
    const { FullName, Email, PhoneNumber, Address } = updatedUser;
    if (!FullName || !Email || !PhoneNumber || !Address) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      setError("Email không hợp lệ!");
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(PhoneNumber)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userId = user.UserID || user.id; // Hỗ trợ cả UserID và id
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        {
          FullName,
          Email,
          PhoneNumber,
          Address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Cập nhật state và localStorage
      const updatedUserData = { ...user, ...updatedUser };
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setError("");
      alert(response.data.message || "Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      setError(err.response?.data?.message || "Lỗi khi cập nhật thông tin!");
    }
  };

  // Tính toán tổng tiền
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = selectedVoucher ? selectedVoucher.discount : 0;
  const shippingFee = subtotal >= 399000 ? 0 : 30000;
  const total = subtotal - discount + shippingFee;

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // Xử lý hoàn tất đơn hàng
  const handleCompleteOrder = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để tiếp tục!");
      navigate("/login?redirect=/checkout");
      return;
    }

    const { FullName, Email, PhoneNumber, Address } = user;
    if (!FullName || !Email || !PhoneNumber || !Address) {
      setError(
        "Vui lòng cập nhật đầy đủ thông tin giao hàng trước khi đặt hàng!"
      );
      return;
    }

    if (!cartItems.length) {
      setError("Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        UserID: user.UserID || user.id, // Hỗ trợ cả UserID và id
        TotalAmount: total,
        PaymentMethod: paymentMethod,
        OrderNotes: orderNotes || null,
        VoucherCode: selectedVoucher ? selectedVoucher.code : null,
        OrderDetails: cartItems.map((item) => ({
          ProductID: item.productId,
          Quantity: item.quantity,
          UnitPrice: item.price,
        })),
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Xóa giỏ hàng sau khi đặt hàng thành công
      localStorage.removeItem("cart");
      localStorage.removeItem("orderNotes");
      localStorage.removeItem("selectedVoucher");
      alert(`Đặt hàng thành công! Mã đơn hàng: ${response.data.orderId}`);
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      setError(
        err.response?.data?.message || "Lỗi khi đặt hàng! Vui lòng thử lại."
      );
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> / <a href="/cart">Giỏ hàng</a> /{" "}
          <span>Thông tin giao hàng</span>
        </div>

        <div className="checkout-content">
          {/* Cột 1: Danh sách sản phẩm */}
          <div className="cart-items">
            <h2>Sản phẩm trong giỏ hàng</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>
                      {item.color} / {item.size} x {item.quantity}
                    </p>
                    <p className="item-subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Giỏ hàng trống!</p>
            )}
          </div>

          {/* Cột 2: Thông tin giao hàng */}
          <div className="shipping-info">
            <h2>Thông tin giao hàng</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="user-info">
              <label>Họ và tên</label>
              <input
                type="text"
                value={updatedUser.FullName}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, FullName: e.target.value })
                }
                placeholder="Nhập họ và tên"
              />
              <label>Email</label>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                <input
                  type="email"
                  value={updatedUser.Email}
                  onChange={(e) =>
                    setUpdatedUser({ ...updatedUser, Email: e.target.value })
                  }
                  placeholder="Nhập email"
                  readOnly
                  tabIndex={-1}
                  onFocus={(e) => e.target.blur()}
                  style={{
                    backgroundColor: "#f0f0f0",
                    color: "#666",
                    cursor: "not-allowed",
                    outline: "none",
                    paddingRight: "30px", // chừa chỗ cho icon
                    width: "100%",
                  }}
                  title="Email là tài khoản (username) của bạn nên không thể thay đổi!"
                />
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none", // không ảnh hưởng đến input
                    color: "#999",
                  }}
                  title="Email là tài khoản (username) của bạn nên không thể thay đổi!"
                >
                  <i class="fa-solid fa-lock"></i>
                </span>
              </div>
              <label>Số điện thoại</label>
              <input
                type="text"
                value={updatedUser.PhoneNumber}
                onChange={(e) =>
                  setUpdatedUser({
                    ...updatedUser,
                    PhoneNumber: e.target.value,
                  })
                }
                placeholder="Nhập số điện thoại"
              />
              <label>Địa chỉ giao hàng</label>
              <input
                type="text"
                value={updatedUser.Address}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, Address: e.target.value })
                }
                placeholder="Nhập địa chỉ"
              />
              <button className="update-btn" onClick={handleUpdateUser}>
                Cập nhật
              </button>
            </div>
          </div>

          {/* Cột 3: Phương thức thanh toán & Thông tin đơn hàng */}
          <div className="payment-order-info">
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

            <h2>Thông tin đơn hàng</h2>
            {orderNotes && (
              <p>
                Ghi chú đơn hàng: <span>{orderNotes}</span>
              </p>
            )}
            {selectedVoucher && selectedVoucher.code && (
              <p>
                Mã giảm giá: <span>{selectedVoucher.name}</span>
              </p>
            )}
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

            <button
              className="complete-order-btn"
              onClick={handleCompleteOrder}
            >
              Hoàn tất đơn hàng
            </button>
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
