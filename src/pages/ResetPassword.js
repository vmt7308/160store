import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../assets/css/ResetPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResetMode, setIsResetMode] = useState(!!token); // Nếu có token → chế độ đổi mật khẩu

  useEffect(() => {
    if (token) {
      setIsResetMode(true);
    }
  }, [token]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.includes("@")) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, thử lại sau.");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu ít nhất 6 ký tự");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset", { token, newPassword });
      setSuccess(response.data.message);
      setTimeout(() => window.location.href = "/login", 3000); // Redirect về login sau 3 giây
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, thử lại sau.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-form">
        <h1>{isResetMode ? "Đổi mật khẩu mới" : "Khôi phục mật khẩu"}</h1>
        {!isResetMode ? (
          <form onSubmit={handleRequestSubmit}>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit">Gửi yêu cầu</button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit">Đổi mật khẩu</button>
          </form>
        )}
        <p>
          Quay lại <Link to="/login">Đăng nhập</Link>
        </p>
        <p className="back-home">
          <Link to="/">← Trở về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
