import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios để gọi API
import "../assets/css/Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.includes("@")) newErrors.email = "Email không hợp lệ";
    if (formData.password.length < 6)
      newErrors.password = "Mật khẩu ít nhất 6 ký tự";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(""); // Reset lỗi server trước khi gửi request
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          formData
        );
        alert("Đăng nhập thành công!");

        // Lưu token vào localStorage
        localStorage.setItem("token", response.data.token);
        navigate("/"); // Quay về trang chính
      } catch (error) {
        setServerError(
          error.response?.data?.message || "Lỗi server, vui lòng thử lại!"
        );
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Đăng nhập</h1>
        {serverError && <p className="error">{serverError}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit">Đăng nhập</button>
        </form>
        <p>
          Quên mật khẩu? <Link to="/reset-password">Khôi phục mật khẩu</Link>
        </p>
        <p>
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
        </p>

        <p className="back-home">
          <Link to="/">← Trở về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
