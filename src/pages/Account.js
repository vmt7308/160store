import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/Account.css";

function Account() {
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("account"); // Tab mặc định là "Tài khoản của tôi"
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Trạng thái sidebar
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/"); // Chuyển hướng về trang chủ nếu chưa đăng nhập
    } else {
      setCurrentUser(JSON.parse(user));
    }
  }, [navigate]);

  // Lấy danh sách đơn hàng đã mua
  useEffect(() => {
    if (activeTab === "orders" && currentUser) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/orders/user/${currentUser.UserID}`
          );
          setOrders(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy đơn hàng:", error);
        }
      };
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // Xử lý chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Xử lý ẩn/hiển thị sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="account-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>DASHBOARD</h2>
          <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
            <i
              className={`fa-solid ${
                isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
              }`}
            ></i>
          </button>
        </div>
        <ul>
          <li
            className={activeTab === "account" ? "active" : ""}
            onClick={() => handleTabChange("account")}
          >
            Tài khoản của tôi
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => handleTabChange("orders")}
          >
            Đơn hàng đã mua
          </li>
          <li
            className={activeTab === "export" ? "active" : ""}
            onClick={() => handleTabChange("export")}
          >
            Đăng xuất
          </li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {activeTab === "account" && (
          <div className="account-info animate-slide-in">
            <h2>THÔNG TIN TÀI KHOẢN CỦA BẠN</h2>
            <p>Quản lý thông tin để bảo mật tài khoản</p>
            <div className="info-section">
              <label>Họ và tên</label>
              <input
                type="text"
                value={currentUser?.FullName || ""}
                readOnly
                placeholder="<Hiển thị thông tin từ db, cho phép thay đổi thông tin>"
              />
            </div>
            <div className="info-section">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={currentUser?.PhoneNumber || ""}
                readOnly
                placeholder="<Hiển thị thông tin từ db, cho phép thay đổi thông tin>"
              />
            </div>
            <div className="info-section">
              <label>Email</label>
              <input
                type="email"
                value={currentUser?.Email || ""}
                readOnly
                placeholder="<Hiển thị thông tin từ db, cho phép thay đổi thông tin>"
              />
            </div>
            <div className="info-section">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={currentUser?.Address || ""}
                readOnly
                placeholder="<Hiển thị thông tin từ db, cho phép thay đổi thông tin>"
              />
            </div>
            <div className="action-buttons">
              <button className="cancel-btn">Hủy thay đổi</button>
              <button className="save-btn">Đổi mật khẩu</button>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-info animate-slide-in">
            <h2>QUẢN LÝ ĐƠN HÀNG CỦA BẠN</h2>
            <p>Xem chi tiết, trạng thái của những đơn hàng đã đặt.</p>
            {orders.length === 0 ? (
              <p>Chưa có đơn hàng nào.</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) =>
                    order.OrderDetails.map((detail, index) => (
                      <tr key={`${order.OrderID}-${index}`}>
                        <td>{order.OrderID}</td>
                        <td>{detail.ProductName}</td>
                        <td>{detail.Quantity}</td>
                        <td>{formatPrice(detail.UnitPrice)}</td>
                        <td>
                          {formatPrice(detail.Quantity * detail.UnitPrice)}
                        </td>
                        <td>{order.Status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "export" && (
          <div className="export-info animate-slide-in">
            <h2>BẢNG XUẤT</h2>
            <p>Chức năng này hiện đang phát triển.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
