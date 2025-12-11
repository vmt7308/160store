import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios để gọi API
import "../assets/css/ResetPassword.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.includes("@")) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email }
      );
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, thử lại sau.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-form">
        <h1>Khôi phục mật khẩu</h1>
        <form onSubmit={handleSubmit}>
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
