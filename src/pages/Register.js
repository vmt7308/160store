import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(""); // ✅ Thêm state để nhận phản hồi từ BE
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.email.includes("@")) newErrors.email = "Email không hợp lệ";
    if (formData.password.length < 6)
      newErrors.password = "Mật khẩu ít nhất 6 ký tự";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không trùng khớp";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: formData.fullName,
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setServerMessage("✅ Đăng ký thành công!");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setServerMessage(`❌ ${data.message}`);
        }
      } catch (error) {
        setServerMessage("❌ Lỗi kết nối đến máy chủ!");
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Đăng ký</h1>
        {serverMessage && (
          <p className="server-message">{serverMessage}</p>
        )}{" "}
        {/* ✅ Hiển thị phản hồi từ BE */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            onChange={handleChange}
          />
          {errors.fullName && <p className="error">{errors.fullName}</p>}

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}

          <button type="submit">Đăng ký</button>
        </form>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
        <p className="back-home">
          <Link to="/">← Trở về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
