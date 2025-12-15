import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Account.css";

function Account() {
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("account");
  const [userInfo, setUserInfo] = useState({
    FullName: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const orderPopupRef = useRef(null);

  // Handle tab focus from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    } else {
      setActiveTab("account");
    }
  }, [location]);

  // Check login status and fetch user info
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/login?redirect=/account");
    } else {
      const parsedUser = JSON.parse(user);
      // Đảm bảo UserID được thiết lập
      const userId = parsedUser.UserID || parsedUser.id;
      if (!userId) {
        console.warn("User data thiếu UserID hoặc id:", parsedUser);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=/account");
        return;
      }
      setCurrentUser({ ...parsedUser, UserID: userId });
      setUserInfo({
        FullName: parsedUser.FullName || "",
        Email: parsedUser.Email || "",
        PhoneNumber: parsedUser.PhoneNumber || "",
        Address: parsedUser.Address || "",
      });
    }
  }, [navigate]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && currentUser && currentUser.UserID) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/orders/user/${currentUser.UserID}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setOrders(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy đơn hàng:", error);
          setError("Không thể tải đơn hàng. Vui lòng thử lại!");
        }
      };
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  // Handle click outside to close order popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        orderPopupRef.current &&
        !orderPopupRef.current.contains(event.target)
      ) {
        setSelectedOrder(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/account?tab=${tab}`);
  };

  // Handle user info update
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUserInfo = async () => {
    const { FullName, Email, PhoneNumber, Address } = userInfo;
    if (!FullName || !Email || !PhoneNumber || !Address) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      setError("Email không hợp lệ!");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(PhoneNumber)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }

    if (
      window.confirm("Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?")
    ) {
      try {
        await axios.put(
          `http://localhost:5000/api/users/${currentUser.UserID}`,
          userInfo,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, ...userInfo })
        );
        setCurrentUser({ ...currentUser, ...userInfo });
        alert("Cập nhật thông tin thành công!");
      } catch (error) {
        setError("Lỗi khi cập nhật thông tin!");
      }
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn đổi mật khẩu không?")) {
      try {
        await axios.post(
          `http://localhost:5000/api/auth/change-password`,
          { currentPassword, newPassword },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Đổi mật khẩu thành công!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        setError(error.response?.data?.message || "Lỗi khi đổi mật khẩu!");
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    alert("Đăng xuất thành công!");
  };

  // Show order details popup
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  // Đơn hàng: Khách hàng có thể hủy đơn hàng trước khi shop xác nhận
  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      await axios.post(
        `http://localhost:5000/api/orders/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Cập nhật realtime
      setOrders(orders.map((order) =>
        order.OrderID === orderId ? { ...order, Status: "Cancelled" } : order
      ));
      alert("Đơn hàng đã được hủy thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Hủy đơn hàng thất bại. Thử lại sau.");
    }
  };

  return (
    <div className="account-container">
      <Header />
      <div className="account-layout">
        {/* Tab Navigation */}
        <div className="tabs">
          <div
            className={`tab-item ${activeTab === "account" ? "active" : ""}`}
            onClick={() => handleTabChange("account")}
          >
            <i className="tab-icon fas fa-user"></i>
            Tài khoản
          </div>
          <div
            className={`tab-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => handleTabChange("orders")}
          >
            <i className="tab-icon fas fa-shopping-bag"></i>
            Đơn hàng
          </div>
          <div className="tab-item" onClick={handleLogout}>
            <i className="tab-icon fas fa-sign-out-alt"></i>
            Đăng xuất
          </div>
          <div className="line"></div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === "account" && (
            <div className="account-info animate-slide-in">
              <h2>THÔNG TIN TÀI KHOẢN</h2>
              {error && <p className="error-message">{error}</p>}
              <div className="account-columns">
                {/* Column 1: User Info */}
                <div className="user-info-column">
                  <h3>Thông tin cá nhân</h3>
                  <div className="info-section">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="FullName"
                      value={userInfo.FullName}
                      onChange={handleUserInfoChange}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="info-section">
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
                        name="Email"
                        value={userInfo.Email}
                        onChange={handleUserInfoChange}
                        placeholder="Nhập email"
                        readOnly
                        tabIndex={-1}
                        onFocus={(e) => e.target.blur()}
                        style={{
                          backgroundColor: "#f0f0f0",
                          color: "#666",
                          cursor: "not-allowed",
                          outline: "none",
                          paddingRight: "30px",
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
                          pointerEvents: "none",
                          color: "#999",
                        }}
                        title="Email là tài khoản (username) của bạn nên không thể thay đổi!"
                      >
                        <i className="fa-solid fa-lock"></i>
                      </span>
                    </div>
                  </div>
                  <div className="info-section">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={userInfo.PhoneNumber}
                      onChange={handleUserInfoChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="info-section">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      name="Address"
                      value={userInfo.Address}
                      onChange={handleUserInfoChange}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                  <button className="update-btn" onClick={handleUpdateUserInfo}>
                    Cập nhật
                  </button>
                </div>

                {/* Column 2: Change Password */}
                <div className="password-column">
                  <h3>Đổi mật khẩu</h3>
                  <div className="info-section">
                    <label>Mật khẩu hiện tại</label>
                    <div className="password-field">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <i className="fa-solid fa-eye-slash"></i>
                        ) : (
                          <i className="fa-solid fa-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="info-section">
                    <label>Mật khẩu mới</label>
                    <div className="password-field">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <i className="fa-solid fa-eye-slash"></i>
                        ) : (
                          <i className="fa-solid fa-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="info-section">
                    <label>Nhập lại mật khẩu mới</label>
                    <div className="password-field">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <i className="fa-solid fa-eye-slash"></i>
                        ) : (
                          <i className="fa-solid fa-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    className="change-password-btn"
                    onClick={handleChangePassword}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-info animate-slide-in">
              <h2>ĐƠN HÀNG ĐÃ MUA</h2>
              {orders.length > 0 && (
                <p className="cancel-note">
                  <span className="note-bold">*Note:</span> Bạn chỉ có thể hủy đơn hàng khi hệ thống chưa xác nhận. Nếu muốn hủy đơn hàng, vui lòng liên hệ với shop để được hỗ trợ. Cảm ơn!
                </p>
              )}
              {error && <p className="error-message">{error}</p>}
              {orders.length === 0 ? (
                <p>Bạn chưa có đơn hàng nào. Shopping ngay thôi!</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.OrderID}>
                        <td>{order.OrderID}</td>
                        <td>
                          {new Date(order.OrderDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>{formatPrice(order.TotalAmount)}</td>
                        <td>{order.Status}</td>
                        <td>
                          <button onClick={() => showOrderDetails(order)}>
                            Xem chi tiết
                          </button>

                          {order.Status === "Pending" && (
                            <button
                              className="cancel-order-btn"
                              onClick={() => handleCancelOrder(order.OrderID)}
                            >
                              Hủy đơn
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Order Details Popup */}
          {selectedOrder && (
            <div className="order-details-overlay">
              <div className="order-details-popup" ref={orderPopupRef}>
                <button
                  className="close-popup"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
                <h3>Chi tiết đơn hàng #{selectedOrder.OrderID}</h3>
                <table className="order-details-table">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Tạm tính</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.OrderDetails.map((detail, index) => (
                      <tr key={`${selectedOrder.OrderID}-${index}`}>
                        <td>{detail.ProductName}</td>
                        <td>{detail.Quantity}</td>
                        <td>{formatPrice(detail.UnitPrice)}</td>
                        <td>
                          {formatPrice(detail.Quantity * detail.UnitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="order-total">
                  Tổng cộng: {formatPrice(selectedOrder.TotalAmount)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Account;
