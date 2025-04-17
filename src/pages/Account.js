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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle user info update
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUserInfo = async () => {
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

  return (
    <div className="account-container">
      {/* <Header /> */}
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header" onClick={toggleSidebar}>
          <i className="fa-solid fa-house"></i>
          {isSidebarOpen && <h2>DASHBOARD</h2>}
        </div>
        <ul>
          <li
            className={activeTab === "account" ? "active" : ""}
            onClick={() => handleTabChange("account")}
          >
            <i className="fa-solid fa-user"></i>
            {isSidebarOpen && "Tài khoản của tôi"}
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => handleTabChange("orders")}
          >
            <i className="fa-solid fa-shopping-bag"></i>
            {isSidebarOpen && "Đơn hàng đã mua"}
          </li>
          <li onClick={handleLogout}>
            <i className="fa-solid fa-sign-out"></i>
            {isSidebarOpen && "Đăng xuất"}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {activeTab === "account" && (
          <div className="account-info animate-slide-in">
            <h2>THÔNG TIN TÀI KHOẢN</h2>
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
                  />
                </div>
                <div className="info-section">
                  <label>Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={userInfo.Email}
                    onChange={handleUserInfoChange}
                  />
                </div>
                <div className="info-section">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="PhoneNumber"
                    value={userInfo.PhoneNumber}
                    onChange={handleUserInfoChange}
                  />
                </div>
                <div className="info-section">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="Address"
                    value={userInfo.Address}
                    onChange={handleUserInfoChange}
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
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="info-section">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="info-section">
                  <label>Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
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
            {error && <p className="error-message">{error}</p>}
            {orders.length === 0 ? (
              <p>Chưa có đơn hàng nào.</p>
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
                        {new Date(order.OrderDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td>{formatPrice(order.TotalAmount)}</td>
                      <td>{order.Status}</td>
                      <td>
                        <button onClick={() => showOrderDetails(order)}>
                          Xem chi tiết
                        </button>
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
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.OrderDetails.map((detail, index) => (
                    <tr key={`${selectedOrder.OrderID}-${index}`}>
                      <td>{detail.ProductName}</td>
                      <td>{detail.Quantity}</td>
                      <td>{formatPrice(detail.UnitPrice)}</td>
                      <td>{formatPrice(detail.Quantity * detail.UnitPrice)}</td>
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
  );
}

export default Account;
