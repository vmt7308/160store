import React, { useState, useEffect } from "react";
import "../assets/css/Admin.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsers(res.data));
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data));
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data));
    axios
      .get("http://localhost:5000/api/orders")
      .then((res) => setOrders(res.data));
    axios
      .get("http://localhost:5000/api/stats")
      .then((res) => setStats(res.data));
  }, []);

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li onClick={() => navigate("/admin")}>Dashboard</li>
          <li onClick={() => navigate("/admin/users")}>Quản lý User</li>
          <li onClick={() => navigate("/admin/categories")}>Danh mục</li>
          <li onClick={() => navigate("/admin/orders")}>Xác nhận đơn hàng</li>
          <li onClick={() => navigate("/admin/stats")}>Thống kê</li>
          <li onClick={() => navigate("/")}>Đăng xuất</li>
        </ul>
      </aside>
      <main className="dashboard">
        <h1>Dashboard</h1>
        <div className="stats">
          <div className="card">
            Doanh thu: {stats.revenue.toLocaleString()} đ
          </div>
          <div className="card">Tổng đơn hàng: {stats.totalOrders}</div>
          <div className="card">Tổng sản phẩm: {stats.totalProducts}</div>
        </div>
        <h2>Quản lý User</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
        <h2>Danh sách sản phẩm</h2>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} - {p.price}đ
            </li>
          ))}
        </ul>
        <h2>Xác nhận đơn hàng</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id}>{order.status}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default Admin;
