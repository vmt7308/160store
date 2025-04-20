import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../assets/css/Admin.css";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState([]);
  const [adminInfo, setAdminInfo] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formData, setFormData] = useState({
    categoryName: "",
    productName: "",
    categoryId: "",
    imageUrl: "",
    price: "",
    descriptions: "",
    userId: "",
    fullName: "",
    userEmail: "",
    phoneNumber: "",
    address: "",
    adminFullName: "",
    adminEmail: "",
    orderId: "",
    status: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
      fetchData(token);
    }
  }, []);

  const fetchData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [
        usersRes,
        categoriesRes,
        productsRes,
        ordersRes,
        statsRes,
        adminRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers }),
        axios.get("http://localhost:5000/api/categories", { headers }),
        axios.get("http://localhost:5000/api/products", { headers }),
        axios.get("http://localhost:5000/api/admin/orders", { headers }),
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/profile", { headers }),
      ]);
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
      setAdminInfo(adminRes.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      localStorage.removeItem("adminToken");
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });
      localStorage.setItem("adminToken", res.data.token);
      setIsAuthenticated(true);
      setError("");
      navigate("/admin/dashboard");
      fetchData(res.data.token);
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi server!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/admin");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/admin/categories",
        { categoryName: formData.categoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
      setFormData({ ...formData, categoryName: "" });
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/categories/${categoryId}`,
        { categoryName: formData.categoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/admin/products",
        {
          categoryId: formData.categoryId,
          productName: formData.productName,
          imageUrl: formData.imageUrl,
          price: formData.price,
          descriptions: formData.descriptions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
      setFormData({
        ...formData,
        categoryId: "",
        productName: "",
        imageUrl: "",
        price: "",
        descriptions: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
    }
  };

  const handleUpdateProduct = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          categoryId: formData.categoryId,
          productName: formData.productName,
          imageUrl: formData.imageUrl,
          price: formData.price,
          descriptions: formData.descriptions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          fullName: formData.fullName,
          email: formData.userEmail,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi cập nhật user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi xóa user:", error);
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        { status: formData.status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/admin/profile",
        { fullName: formData.adminFullName, email: formData.adminEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin admin:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <h2>Đăng nhập Admin</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email"
            />
          </div>
          <div className="form-group password-field">
            <label>Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
              ></i>
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn">
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => handleTabChange("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => handleTabChange("users")}
          >
            Quản lý khách hàng
          </li>
          <li
            className={activeTab === "categories" ? "active" : ""}
            onClick={() => handleTabChange("categories")}
          >
            Danh mục
          </li>
          <li
            className={activeTab === "products" ? "active" : ""}
            onClick={() => handleTabChange("products")}
          >
            Sản phẩm
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => handleTabChange("orders")}
          >
            Xác nhận đơn hàng
          </li>
          <li
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => handleTabChange("stats")}
          >
            Thống kê
          </li>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => handleTabChange("profile")}
          >
            Thông tin Admin
          </li>
          <li onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </aside>
      <main className="dashboard">
        {activeTab === "dashboard" && (
          <div>
            <h1>Tổng quan</h1>
            <div className="stats">
              <div className="card">
                Doanh thu:{" "}
                {stats
                  .reduce((sum, stat) => sum + stat.TotalRevenue, 0)
                  .toLocaleString()}{" "}
                đ
              </div>
              <div className="card">Tổng đơn hàng: {orders.length}</div>
              <div className="card">Tổng sản phẩm: {products.length}</div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2>Quản lý khách hàng</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.UserID}>
                    <td>{user.UserID}</td>
                    <td>{user.FullName}</td>
                    <td>{user.Email}</td>
                    <td>{user.PhoneNumber}</td>
                    <td>{user.Address}</td>
                    <td>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            userId: user.UserID,
                            fullName: user.FullName,
                            userEmail: user.Email,
                            phoneNumber: user.PhoneNumber,
                            address: user.Address,
                          });
                        }}
                      >
                        Sửa
                      </button>
                      <button onClick={() => handleDeleteUser(user.UserID)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(formData.userId);
              }}
            >
              <h3>Cập nhật thông tin khách hàng</h3>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Họ tên"
              />
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Số điện thoại"
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Địa chỉ"
              />
              <button type="submit">Cập nhật</button>
            </form>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <h2>Quản lý danh mục</h2>
            <form onSubmit={handleCreateCategory}>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                placeholder="Tên danh mục"
              />
              <button type="submit">Thêm danh mục</button>
            </form>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.CategoryID}>
                    <td>{category.CategoryID}</td>
                    <td>{category.CategoryName}</td>
                    <td>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            categoryName: category.CategoryName,
                          });
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCategory(category.CategoryID)
                        }
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateCategory(category.CategoryID)
                        }
                      >
                        Lưu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h2>Quản lý sản phẩm</h2>
            <form onSubmit={handleCreateProduct}>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.CategoryID} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Tên sản phẩm"
              />
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="URL hình ảnh"
              />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Giá"
              />
              <input
                type="text"
                name="descriptions"
                value={formData.descriptions}
                onChange={handleInputChange}
                placeholder="Mô tả"
              />
              <button type="submit">Thêm sản phẩm</button>
            </form>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.ProductID}>
                    <td>{product.ProductID}</td>
                    <td>{product.ProductName}</td>
                    <td>
                      {
                        categories.find(
                          (c) => c.CategoryID === product.CategoryID
                        )?.CategoryName
                      }
                    </td>
                    <td>{product.Price.toLocaleString()} đ</td>
                    <td>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            categoryId: product.CategoryID,
                            productName: product.ProductName,
                            imageUrl: product.ImageURL,
                            price: product.Price,
                            descriptions: product.Descriptions,
                          });
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.ProductID)}
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleUpdateProduct(product.ProductID)}
                      >
                        Lưu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2>Xác nhận đơn hàng</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.OrderID}>
                    <td>{order.OrderID}</td>
                    <td>{order.FullName}</td>
                    <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                    <td>{order.TotalAmount.toLocaleString()} đ</td>
                    <td>{order.Status}</td>
                    <td>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.OrderID)}
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2>Thống kê doanh thu</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.Month}>
                    <td>{stat.Month}</td>
                    <td>{stat.TotalRevenue.toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2>Thông tin Admin</h2>
            <form onSubmit={handleUpdateAdmin}>
              <input
                type="text"
                name="adminFullName"
                value={formData.adminFullName}
                onChange={handleInputChange}
                placeholder="Họ tên"
              />
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <button type="submit">Cập nhật</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
