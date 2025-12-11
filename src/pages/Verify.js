import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../assets/css/Verify.css";

const Verify = () => {
  const [message, setMessage] = useState("Đang xác thực tài khoản...");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage("Link xác thực không hợp lệ!");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/verify?token=${token}`,
          {
            method: "GET",
            credentials: "include", // QUAN TRỌNG: Fix lỗi kết nối server
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setMessage("Xác thực thành công! Đang chuyển đến trang đăng nhập...");
          setIsSuccess(true);
          // Tự động về login sau 3 giây
          setTimeout(() => navigate("/login", { replace: true }), 3000);
        } else {
          setMessage(data.message || "Link đã hết hạn hoặc không hợp lệ!");
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setMessage("Không thể kết nối đến server. Vui lòng thử lại sau!");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-wrapper">
      <div className="verify-box">
        {isSuccess ? (
          <i className="fa-solid fa-circle-check success-icon"></i>
        ) : (
          <i className="fa-solid fa-triangle-exclamation error-icon"></i>
        )}
        <h2>{message}</h2>
        <p>
          {isSuccess
            ? "Tài khoản đã được kích hoạt thành công!"
            : "Vui lòng kiểm tra lại link hoặc đăng ký lại."}
        </p>
        <button onClick={() => navigate("/login", { replace: true })} className="verify-btn">
          Đi đến Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default Verify;