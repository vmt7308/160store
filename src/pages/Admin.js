import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/Admin.css";
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import 'chart.js/auto'; // Auto register Chart.js components

function Admin() {
  const navigate = useNavigate();
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
  const [reviews, setReviews] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [adminProfile, setAdminProfile] = useState({});
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
    currentPassword: "",   // Mới thêm cho mật khẩu hiện tại
    adminPassword: "",     // Mật khẩu mới
    orderId: "",
    status: "",
  });
  const [sidebarWidth, setSidebarWidth] = useState(220); // State cho width sidebar, mặc định 220
  const resizerRef = useRef(null); // Ref cho resizer
  const [isCollapsed, setIsCollapsed] = useState(false); // State collapse
  const [isDarkMode, setIsDarkMode] = useState(false);   // State dark mode

  // Tổng quan
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalNewsletter, setTotalNewsletter] = useState(0);

  // Dark mode: kiểm tra localStorage & system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Áp dụng theme vào <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Toast function
  const toast = ({
    title = "",
    message = "",
    type = "info",
    duration = 3000,
  }) => {
    const main = document.getElementById("toast");
    if (main) {
      const toast = document.createElement("div");

      const autoRemoveId = setTimeout(function () {
        main.removeChild(toast);
      }, duration + 1000);

      toast.onclick = function (e) {
        if (e.target.closest(".toast__close")) {
          main.removeChild(toast);
          clearTimeout(autoRemoveId);
        }
      };

      const icons = {
        success: "fas fa-check-circle",
        info: "fas fa-info-circle",
        warning: "fas fa-exclamation-circle",
        error: "fas fa-exclamation-circle",
      };
      const icon = icons[type];
      const delay = (duration / 1000).toFixed(2);

      toast.classList.add("toast", `toast--${type}`);
      toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

      toast.innerHTML = `
        <div class="toast__icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">${message}</p>
        </div>
        <div class="toast__close">
            <i class="fas fa-times"></i>
        </div>
      `;
      main.appendChild(toast);
    }
  };

  const showSuccessToast = useCallback((message) => {
    toast({
      title: "Thành công!",
      message,
      type: "success",
      duration: 5000,
    });
  }, []);

  const showErrorToast = useCallback((message) => {
    toast({
      title: "Thất bại!",
      message,
      type: "error",
      duration: 5000,
    });
  }, []);

  const fetchData = useCallback(async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        usersRes,
        categoriesRes,
        productsRes,
        ordersRes,
        statsRes,
        adminRes,
        reviewsRes,
        newsletterRes,
        totalRevenueRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers }),
        axios.get("http://localhost:5000/api/categories", { headers }),
        axios.get("http://localhost:5000/api/products", { headers }),
        axios.get("http://localhost:5000/api/admin/orders", { headers }),
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/profile", { headers }),
        axios.get("http://localhost:5000/api/admin/reviews", { headers }),
        axios.get("http://localhost:5000/api/admin/newsletter", { headers }),
        axios.get("http://localhost:5000/api/admin/stats/total-revenue", { headers }),
      ]);

      // SET LIST DATA (KHÔNG ĐỤNG FORM)
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
      setReviews(reviewsRes.data);
      setNewsletter(newsletterRes.data);

      // Tổng quan
      setTotalRevenue(totalRevenueRes.data.totalRevenue || 0);
      setTotalCategories(categoriesRes.data.length);
      setTotalReviews(reviewsRes.data.length);
      setTotalNewsletter(newsletterRes.data.length);

      // SET ADMIN PROFILE RIÊNG
      setAdminProfile(adminRes.data);

    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      localStorage.removeItem("adminToken");
      setIsAuthenticated(false);
      showErrorToast("Có lỗi xảy ra khi lấy dữ liệu, vui lòng thử lại.");
    }
  }, [showErrorToast]);

  useEffect(() => {
    if (adminProfile?.AdminID) {
      setFormData((prev) => ({
        ...prev,
        adminFullName: adminProfile.FullName || "",
        adminEmail: adminProfile.Email || "",
        adminPassword: "",
      }));
    }
  }, [adminProfile]);


  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
      fetchData(token);
    }
  }, [fetchData]);

  // Xử lý resize sidebar
  useEffect(() => {
    const resizer = resizerRef.current;
    let isResizing = false;
    let startX;
    let startWidth;

    const onMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebarWidth;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isResizing) return;
      const delta = e.clientX - startX;
      const newWidth = Math.max(150, startWidth + delta); // Min width 150px
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    if (resizer) {
      resizer.addEventListener("mousedown", onMouseDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener("mousedown", onMouseDown);
      }
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [sidebarWidth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu!");
      showErrorToast("Vui lòng nhập đầy đủ email và mật khẩu.");
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
      showSuccessToast("Đăng nhập thành công.");
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi server!");
      showErrorToast(
        error.response?.data?.message || "Lỗi server, vui lòng thử lại."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/admin");
    showSuccessToast("Đăng xuất thành công.");
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

    if (!window.confirm("Bạn có chắc muốn tạo danh mục này không?")) {
      return;
    }

    if (!formData.categoryName || formData.categoryName.trim() === "") {
      alert("Tên danh mục không được để trống.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/admin/categories",
        { categoryName: formData.categoryName.trim() }, // trim để loại bỏ khoảng trắng thừa
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
      setFormData({ ...formData, categoryName: "" });
      showSuccessToast("Tạo danh mục thành công.");
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      showErrorToast("Có lỗi xảy ra khi tạo danh mục, vui lòng thử lại.");
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!window.confirm("Bạn có chắc muốn cập nhật danh mục này không?")) {
      return;
    }

    if (!formData.categoryName || formData.categoryName.trim() === "") {
      alert("Tên danh mục không được để trống.");
      return;
    }

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
      showSuccessToast("Cập nhật danh mục thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      showErrorToast("Có lỗi xảy ra khi cập nhật danh mục, vui lòng thử lại.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      return;
    }

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
      showSuccessToast("Xóa danh mục thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      showErrorToast("Có lỗi xảy ra khi xóa danh mục, vui lòng thử lại.");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!window.confirm("Bạn có chắc muốn tạo sản phẩm này không?")) {
      return;
    }

    if (!formData.categoryId === "") {
      alert("Bạn chưa chọn danh mục sản phẩm.");
      return;
    }
    if (!formData.productName || formData.productName.trim() === "") {
      alert("Tên sản phẩm không được để trống.");
      return;
    }
    if (!formData.imageUrl || formData.imageUrl.trim() === "") {
      alert("URL ảnh sản phẩm không được để trống.");
      return;
    }
    if (!formData.price === "") {
      alert("Giá sản phẩm không được để trống.");
      return;
    }
    if (!formData.descriptions || formData.descriptions.trim() === "") {
      alert("Mô tả sản phẩm không được để trống.");
      return;
    }

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
      showSuccessToast("Tạo sản phẩm thành công.");
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      showErrorToast("Có lỗi xảy ra khi tạo sản phẩm, vui lòng thử lại.");
    }
  };

  const handleUpdateProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn cập nhật sản phẩm này không?")) {
      return;
    }

    if (!formData.categoryId === "") {
      alert("Bạn chưa chọn danh mục sản phẩm.");
      return;
    }
    if (!formData.productName || formData.productName.trim() === "") {
      alert("Tên sản phẩm không được để trống.");
      return;
    }
    if (!formData.imageUrl || formData.imageUrl.trim() === "") {
      alert("URL ảnh sản phẩm không được để trống.");
      return;
    }
    if (!formData.price === "") {
      alert("Giá sản phẩm không được để trống.");
      return;
    }
    if (!formData.descriptions || formData.descriptions.trim() === "") {
      alert("Mô tả sản phẩm không được để trống.");
      return;
    }

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
      showSuccessToast("Cập nhật sản phẩm thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      showErrorToast("Có lỗi xảy ra khi cập nhật sản phẩm, vui lòng thử lại.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
      return;
    }

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
      showSuccessToast("Xóa sản phẩm thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      showErrorToast("Có lỗi xảy ra khi xóa sản phẩm, vui lòng thử lại.");
    }
  };

  const handleUpdateUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn cập nhật thông tin khách hàng này không?")) {
      return;
    }

    if (!formData.fullName || formData.fullName.trim() === "") {
      alert("Họ tên khách hàng không được để trống.");
      return;
    }
    if (!formData.userEmail || formData.userEmail.trim() === "") {
      alert("Email khách hàng không được để trống.");
      return;
    }
    // Regex kiểm tra định dạng email hợp lệ (chuẩn phổ biến)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.userEmail.trim())) {
      alert("Email khách hàng không đúng định dạng (ví dụ: example@gmail.com).");
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      alert("SĐT khách hàng không được để trống.");
      return;
    }
    // Regex kiểm tra số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84, 9-10 số)
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      alert("SĐT khách hàng không đúng định dạng (ví dụ: 0901234567 hoặc 0912345678).");
      return;
    }
    if (!formData.address || formData.address.trim() === "") {
      alert("Địa chỉ khách hàng không được để trống.");
      return;
    }

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
      showSuccessToast("Cập nhật thông tin khách hàng thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật user:", error);
      showErrorToast(
        "Có lỗi xảy ra khi cập nhật khách hàng, vui lòng thử lại."
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này không?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      fetchData(localStorage.getItem("adminToken"));
      showSuccessToast("Xóa khách hàng thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa user:", error);
      showErrorToast("Có lỗi xảy ra khi xóa khách hàng, vui lòng thử lại.");
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn cập nhật trạng thái đơn hàng này không?")) {
      return;
    }

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
      showSuccessToast("Cập nhật trạng thái đơn hàng thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      showErrorToast(
        "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng, vui lòng thử lại."
      );
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    if (!window.confirm("Bạn có chắc muốn cập nhật thông tin admin này không?")) {
      return;
    }

    if (!formData.adminFullName || formData.adminFullName.trim() === "") {
      alert("Họ tên Admin không được để trống.");
      return;
    }
    // Validate mật khẩu hiện tại (bắt buộc nếu muốn đổi mật khẩu mới)
    if (formData.adminPassword && (!formData.currentPassword || formData.currentPassword.trim() === "")) {
      alert("Vui lòng nhập mật khẩu hiện tại để xác nhận trước khi đổi mật khẩu mới.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      // Chuẩn bị data gửi lên BE
      const updateData = {
        fullName: formData.adminFullName.trim(),
      };

      // Chỉ gửi mật khẩu mới nếu người dùng nhập và xác nhận mật khẩu hiện tại
      if (formData.adminPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword.trim(); // Gửi để BE so sánh
        updateData.newPassword = formData.adminPassword.trim();       // Mật khẩu mới sẽ được BE mã hóa
      }

      await axios.put("http://localhost:5000/api/admin/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSuccessToast("Cập nhật thông tin admin thành công.");

      // Reset mật khẩu sau khi cập nhật thành công
      setFormData({
        ...formData,
        currentPassword: "",
        adminPassword: "",
      });

      fetchData(token);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin admin:", error);
      if (error.response?.status === 401) {
        showErrorToast("Mật khẩu hiện tại không đúng.");
      } else {
        showErrorToast(
          "Có lỗi xảy ra khi cập nhật thông tin admin, vui lòng thử lại."
        );
      }
    }
  };

  // Hàm xóa review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa review này không?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchData(localStorage.getItem("adminToken"));
      showSuccessToast("Xóa review thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa review:", error);
      showErrorToast(
        "Có lỗi xảy ra khi xóa review, vui lòng thử lại."
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div id="toast"></div>
        <h2>Đăng nhập Admin</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email"
              autoFocus // Tự động focus khi vào trang
            />
          </div>
          <div className="form-group password-field">
            <label htmlFor="admin-password">Mật khẩu</label>
            <input
              id="admin-password"
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
      <div id="toast"></div>
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <ul>
          <li
            onClick={toggleCollapse}
            title="Collapse"
          >
            <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            <span>160 STORE</span>
          </li>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => handleTabChange("dashboard")}
            title="Tổng quan"
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => handleTabChange("users")}
            title="Khách hàng"
          >
            <i className="fas fa-users"></i>
            <span>Khách hàng</span>
          </li>
          <li
            className={activeTab === "categories" ? "active" : ""}
            onClick={() => handleTabChange("categories")}
            title="Danh mục"
          >
            <i className="fas fa-list-ul"></i>
            <span>Danh mục</span>
          </li>
          <li
            className={activeTab === "products" ? "active" : ""}
            onClick={() => handleTabChange("products")}
            title="Sản phẩm"
          >
            <i className="fas fa-box"></i>
            <span>Sản phẩm</span>
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => handleTabChange("orders")}
            title="Đơn hàng"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Đơn hàng</span>
          </li>
          <li
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => handleTabChange("stats")}
            title="Thống kê"
          >
            <i className="fas fa-chart-bar"></i>
            <span>Thống kê</span>
          </li>
          <li
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => handleTabChange("reviews")}
            title="Đánh giá"
          >
            <i className="fas fa-star"></i>
            <span>Đánh giá</span>
          </li>
          <li
            className={activeTab === "newsletter" ? "active" : ""}
            onClick={() => handleTabChange("newsletter")}
            title="Newsletter"
          >
            <i className="fas fa-envelope"></i>
            <span>Newsletter</span>
          </li>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => handleTabChange("profile")}
            title="Thông tin Admin"
          >
            <i className="fas fa-user-cog"></i>
            <span>Thông tin Admin</span>
          </li>
          <li
            onClick={toggleDarkMode}
            title="Dark mode"
          >
            <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
            <span>Dark mode</span>
          </li>
          <li
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </li>
        </ul>
      </aside>
      <div className="resizer" ref={resizerRef}></div> {/* Resizer */}
      <main className="dashboard">
        {activeTab === "dashboard" && (
          <div>
            <h2>Tổng quan</h2>
            <div className="stats">
              <div className="card">
                <h3>Doanh thu</h3>
                <p>{totalRevenue.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="card">
                <h3>Khách hàng</h3>
                <p>{users.length}</p>
              </div>
              <div className="card">
                <h3>Danh mục</h3>
                <p>{totalCategories}</p>
              </div>
              <div className="card">
                <h3>Sản phẩm</h3>
                <p>{products.length}</p>
              </div>
              <div className="card">
                <h3>Đơn hàng</h3>
                <p>{orders.length}</p>
              </div>
              <div className="card">
                <h3>Thống kê</h3>
                <p>{stats.length} tháng</p>
              </div>
              <div className="card">
                <h3>Đánh giá</h3>
                <p>{totalReviews}</p>
              </div>
              <div className="card">
                <h3>Newsletter</h3>
                <p>{totalNewsletter}</p>
              </div>
            </div>

            {/* Phần charts cho Tổng quan */}
            <div className="charts-section">
              {/* Chart 1: Doanh thu (Bar Chart - phù hợp cho giá trị số lớn theo thời gian) */}
              <div className="chart-card">
                <h4>Doanh thu theo tháng (Bar Chart)</h4>
                <Bar
                  data={{
                    labels: stats.map((stat) => stat.Month), // Labels là các tháng
                    datasets: [
                      {
                        label: "Doanh thu",
                        data: stats.map((stat) => stat.TotalRevenue), // Data là doanh thu từng tháng
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>

              {/* Chart 2: Khách hàng (Line Chart - phù hợp cho sự thay đổi số lượng theo thời gian) */}
              <div className="chart-card">
                <h4>Khách hàng mới theo tháng (Line Chart)</h4>
                <Line
                  data={{
                    labels: stats.map((stat) => stat.Month), // Dùng tháng từ stats
                    datasets: [
                      {
                        label: "Khách hàng mới",
                        data: stats.map(() => Math.random() * 100), // Placeholder: thay bằng data thực từ BE nếu có
                        fill: false,
                        borderColor: "rgba(153, 102, 255, 1)",
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>

              {/* Chart 3: Danh mục (Pie Chart - phù hợp cho phân bổ phần trăm) */}
              <div className="chart-card">
                <h4>Phân bổ sản phẩm theo danh mục (Pie Chart)</h4>
                <Pie
                  data={{
                    labels: categories.map((cat) => cat.CategoryName), // Labels là tên danh mục
                    datasets: [
                      {
                        data: categories.map((cat) =>
                          products.filter((prod) => prod.CategoryID === cat.CategoryID).length // Số sản phẩm mỗi danh mục
                        ),
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.6)",
                          "rgba(54, 162, 235, 0.6)",
                          "rgba(255, 206, 86, 0.6)",
                          "rgba(75, 192, 192, 0.6)",
                        ],
                        hoverOffset: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                  }}
                />
              </div>

              {/* Chart 4: Sản phẩm (Doughnut Chart - phù hợp cho tổng và tỷ lệ) */}
              <div className="chart-card">
                <h4>Tỷ lệ sản phẩm bán chạy (Doughnut Chart)</h4>
                <Doughnut
                  data={{
                    labels: products.slice(0, 5).map((prod) => prod.ProductName), // Top 5 sản phẩm (placeholder)
                    datasets: [
                      {
                        data: products.slice(0, 5).map(() => Math.random() * 100), // Placeholder: thay bằng data bán chạy thực
                        backgroundColor: [
                          "rgba(153, 102, 255, 0.6)",
                          "rgba(255, 159, 64, 0.6)",
                          "rgba(255, 205, 86, 0.6)",
                          "rgba(75, 192, 192, 0.6)",
                          "rgba(54, 162, 235, 0.6)",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                  }}
                />
              </div>

              {/* Chart 5: Đơn hàng (Radar Chart - phù hợp cho đa chiều, như trạng thái đơn hàng) */}
              <div className="chart-card">
                <h4>Trạng thái đơn hàng (Radar Chart)</h4>
                <Radar
                  data={{
                    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], // Các trạng thái
                    datasets: [
                      {
                        label: "Số lượng đơn hàng",
                        data: [
                          orders.filter((ord) => ord.Status === 'Pending').length,
                          orders.filter((ord) => ord.Status === 'Processing').length,
                          orders.filter((ord) => ord.Status === 'Shipped').length,
                          orders.filter((ord) => ord.Status === 'Delivered').length,
                          orders.filter((ord) => ord.Status === 'Cancelled').length,
                        ],
                        backgroundColor: "rgba(179, 181, 198, 0.2)",
                        borderColor: "rgba(179, 181, 198, 1)",
                        pointBackgroundColor: "rgba(179, 181, 198, 1)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                  }}
                />
              </div>

              {/* Chart 6: Thống kê (PolarArea Chart - phù hợp cho tỷ lệ đa loại) */}
              <div className="chart-card">
                <h4>Phân bổ doanh thu theo tháng (PolarArea Chart)</h4>
                <PolarArea
                  data={{
                    labels: stats.map((stat) => stat.Month), // Tháng
                    datasets: [
                      {
                        data: stats.map((stat) => stat.TotalRevenue), // Doanh thu
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.6)",
                          "rgba(75, 192, 192, 0.6)",
                          "rgba(255, 205, 86, 0.6)",
                          "rgba(54, 162, 235, 0.6)",
                          "rgba(153, 102, 255, 0.6)",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                  }}
                />
              </div>

              {/* Chart 7: Đánh giá (Bubble Chart - phù hợp cho dữ liệu đa chiều như rating + số lượng) */}
              <div className="chart-card">
                <h4>Phân bố đánh giá (Bubble Chart)</h4>
                <Bubble
                  data={{
                    datasets: [
                      {
                        label: "Đánh giá",
                        data: reviews.map((rev) => ({
                          x: new Date(rev.CreatedAt).getMonth() + 1, // Tháng
                          y: rev.Rating, // Sao
                          r: 10, // Kích thước bubble (placeholder, có thể dựa vào số lượng)
                        })),
                        backgroundColor: "rgba(255, 159, 64, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: { title: { display: true, text: "Tháng" } },
                      y: { title: { display: true, text: "Sao" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2>Quản lý Khách hàng</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(formData.userId); }}>
              <div className="form-horizontal">
                <div className="form-row">
                  <label htmlFor="user-fullName">Họ tên:</label>
                  <input
                    id="user-fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Họ tên"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="user-email">Email:</label>
                  <input
                    id="user-email"
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="user-sdt">SĐT:</label>
                  <input
                    id="user-sdt"
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="SĐT"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="user-address">Địa chỉ:</label>
                  <input
                    id="user-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ"
                  />
                </div>
                <button type="submit" className="submit-btn">Cập nhật User</button>
              </div>
            </form>
            <div className="table-container"> {/* Wrap table */}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Địa chỉ</th>
                    <th>Xác thực</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.UserID}>
                        <td>{user.UserID}</td>
                        <td>{user.FullName}</td>
                        <td>{user.Email}</td>
                        <td>{user.PhoneNumber || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{user.Address || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{user.IsVerified ? "Đã xác thực" : "Chưa xác thực"}</td>
                        <td>{new Date(user.CreatedAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="edit-btn"
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
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.UserID)}
                          >
                            Xóa
                          </button>
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateUser(user.UserID)}
                          >
                            Lưu
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <h2>Quản lý Danh mục</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="form-horizontal">
                <div className="form-row">
                  <label htmlFor="category-categoryName">Tên danh mục:</label>
                  <input
                    id="category-categoryName"
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    placeholder="Tên danh mục"
                  />
                </div>
                <button type="submit" className="submit-btn">Thêm danh mục</button>
              </div>
            </form>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.CategoryID}>
                        <td>{category.CategoryID}</td>
                        <td>{category.CategoryName}</td>
                        <td>
                          <button
                            className="edit-btn"
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
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category.CategoryID)}
                          >
                            Xóa
                          </button>
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateCategory(category.CategoryID)}
                          >
                            Lưu
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h2>Quản lý Sản phẩm</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="form-horizontal">
                <div className="form-row">
                  <label htmlFor="category-categoryId">Danh mục:</label>
                  <select
                    id="category-categoryId"
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
                </div>
                <div className="form-row">
                  <label htmlFor="product-productName">Tên sản phẩm:</label>
                  <input
                    id="product-productName"
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Tên sản phẩm"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="product-imageUrl">URL ảnh:</label>
                  <input
                    id="product-imageUrl"
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="URL ảnh"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="product-price">Giá:</label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Giá"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="product-descriptions">Mô tả:</label>
                  <input
                    id="product-descriptions"
                    type="text"
                    name="descriptions"
                    value={formData.descriptions}
                    onChange={handleInputChange}
                    placeholder="Mô tả"
                  />
                </div>
                <button type="submit" className="submit-btn">Thêm sản phẩm</button>
              </div>
            </form>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Ảnh</th>
                    <th>Mô tả</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
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
                        <td>{product.ImageURL || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{product.Descriptions || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{new Date(product.CreatedAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="edit-btn"
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
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product.ProductID)}
                          >
                            Xóa
                          </button>
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateProduct(product.ProductID)}
                          >
                            Lưu
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2>Xác nhận đơn hàng</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Phương thức thanh toán</th>
                    <th>Ghi chú</th>
                    <th>Mã voucher</th>
                    <th>Trạng thái thanh toán</th>
                    <th>Chi tiết đơn</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.OrderID}>
                        <td>{order.OrderID}</td>
                        <td>{order.FullName}</td>
                        <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                        <td>{order.TotalAmount.toLocaleString()} đ</td>
                        <td>{order.Status}</td>
                        <td>{order.PaymentMethod}</td>
                        <td>{order.OrderNotes || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{order.VoucherCode || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{order.PaymentStatus}</td>
                        <td>
                          <ul>
                            {order.OrderDetails.map((detail) => (
                              <li key={detail.OrderDetailID}>
                                ID: {detail.OrderDetailID}, Sản phẩm: {detail.ProductName}, Số lượng: {detail.Quantity}, Giá: {detail.UnitPrice.toLocaleString()} đ
                              </li>
                            ))}
                          </ul>
                        </td>
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
                            className="update-btn"
                            onClick={() => handleUpdateOrderStatus(order.OrderID)}
                          >
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2>Thống kê doanh thu</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tháng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length > 0 ? (
                    stats.map((stat) => (
                      <tr key={stat.Month}>
                        <td>{stat.Month}</td>
                        <td>{stat.TotalRevenue.toLocaleString()} đ</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Phần charts cho Thống kê */}
            <div className="charts-section">
              {/* Chart 8: Doanh thu theo tháng (Scatter Chart - phù hợp cho dữ liệu rời rạc theo thời gian) */}
              <div className="chart-card">
                <h4>Doanh thu theo tháng (Scatter Chart)</h4>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "Doanh thu",
                        data: stats.map((stat) => ({
                          x: stat.Month, // Tháng
                          y: stat.TotalRevenue, // Doanh thu
                        })),
                        backgroundColor: "rgba(75, 192, 192, 1)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: { type: 'category', title: { display: true, text: "Tháng" } },
                      y: { beginAtZero: true, title: { display: true, text: "Doanh thu" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2>Quản lý Đánh giá</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Đơn hàng ID</th>
                    <th>Sản phẩm ID</th>
                    <th>Người dùng ID</th>
                    <th>Điểm</th>
                    <th>Bình luận</th>
                    <th>Tên</th>
                    <th>Ảnh</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <tr key={review.ReviewID}>
                        <td>{review.ReviewID}</td>
                        <td>{review.OrderID}</td>
                        <td>{review.ProductID}</td>
                        <td>{review.UserID}</td>
                        <td>{review.Rating}</td>
                        <td>{review.Comment || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{review.FullName}</td>
                        <td>{review.ImageURL || <span className="no-data">Không có dữ liệu</span>}</td>
                        <td>{new Date(review.CreatedAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteReview(review.ReviewID)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "newsletter" && (
          <div>
            <h2>Quản lý Newsletter</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletter.length > 0 ? (
                    newsletter.map((item) => (
                      <tr key={item.ID}>
                        <td>{item.ID}</td>
                        <td>{item.Email}</td>
                        <td>{new Date(item.CreatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2>Thông tin Admin</h2>
            <p>Admin ID: {adminProfile.AdminID}</p>
            <p>Ngày tạo: {new Date(adminProfile.CreatedAt).toLocaleDateString()}</p>
            <form onSubmit={handleUpdateAdmin}>
              <div className="form-horizontal">
                <div className="form-row">
                  <label htmlFor="profile-adminFullName">Họ tên:</label>
                  <input
                    id="profile-adminFullName"
                    type="text"
                    name="adminFullName"
                    value={formData.adminFullName}
                    onChange={handleInputChange}
                    placeholder="Họ tên"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="profile-adminEmail">Email:</label>
                  <div className="admin-email-wrapper">
                    <input
                      id="profile-adminEmail"
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      readOnly
                      placeholder="Email"
                    />
                    {/* Tooltip element */}
                    <div className="tooltip">
                      Email là duy nhất! Không thể thay đổi.
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="profile-currentPassword">Mật khẩu cũ:</label>
                  <input
                    id="profile-currentPassword"
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu cũ"
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="profile-adminPassword">Mật khẩu mới:</label>
                  <input
                    id="profile-adminPassword"
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới (nếu muốn thay đổi)"
                  />
                </div>
                <button type="submit" className="submit-btn">Cập nhật</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
