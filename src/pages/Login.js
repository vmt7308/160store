import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../assets/css/Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  // Thêm state để kiểm soát hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);

  // Auto focus Email khi vào trang
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.includes("@")) {
      errors.email = "Email không hợp lệ!";
    }
    if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      // Gửi yêu cầu đăng nhập
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);

      // Lấy thông tin chi tiết user từ API
      const userDetailsResponse = await axios.get(
        `http://localhost:5000/api/users/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Kết hợp thông tin từ login và thông tin chi tiết
      const updatedUser = {
        ...user,
        ...userDetailsResponse.data,
        UserID: user.id, // Đảm bảo UserID được lưu
      };

      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Đăng nhập thành công!");
      navigate(redirect);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Lỗi server, vui lòng thử lại!");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Đăng nhập</h1>
        {serverError && <p className="error">{serverError}</p>}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <input
            ref={emailRef}
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          {/* Password */}
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              value={formData.password}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )}
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          {/* Submit */}
          <button type="submit">Đăng nhập</button>
        </form>

        {/* Links */}
        <p>
          Quên mật khẩu?{" "}
          <Link to="/reset-password">Khôi phục mật khẩu</Link>
        </p>
        <p>
          Chưa có tài khoản?{" "}
          <Link to="/register">Đăng ký ngay</Link>
        </p>
        <p className="back-home">
          <Link to="/">← Trở về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
