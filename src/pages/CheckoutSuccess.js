import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CheckoutSuccess = () => {
    const location = useLocation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        // Lấy các tham số từ MoMo callback
        const resultCode = params.get("resultCode");
        const momoOrderId = params.get("orderId"); // ORDER_19 (từ MoMo)

        // Trích xuất orderId thật từ momoOrderId (ví dụ: ORDER_19 → 19)
        if (momoOrderId && momoOrderId.startsWith("ORDER_")) {
            const extractedId = momoOrderId.replace("ORDER_", "");
            setOrderId(extractedId);
        }

        if (resultCode === "0") {
            // ✅ THANH TOÁN MOMO THÀNH CÔNG
            setIsSuccess(true);

            // Chỉ xóa dữ liệu tạm khi thành công
            localStorage.removeItem("cart");
            localStorage.removeItem("orderNotes");
            localStorage.removeItem("selectedVoucher");
        } else {
            // ❌ THANH TOÁN THẤT BẠI HOẶC BỊ HỦY
            setIsSuccess(false);
        }
    }, [location.search]);

    return (
        <>
            <Header />
            <div style={{ textAlign: "center", padding: "50px", minHeight: "60vh" }}>
                {isSuccess ? (
                    <>
                        <h1 style={{ color: "green" }}>
                            🎉 Thanh toán MoMo thành công!
                        </h1>
                        <p>Cảm ơn bạn đã mua hàng tại 160STORE.</p>
                        <p>
                            Đơn hàng{" "}
                            {orderId ? (
                                <strong>#{orderId}</strong>
                            ) : (
                                "của bạn"
                            )}{" "}
                            đã được ghi nhận và đang được xử lý.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={{ color: "red" }}>
                            ❌ Thanh toán MoMo không thành công
                        </h1>
                        <p>Giao dịch chưa hoàn tất hoặc đã bị huỷ.</p>
                        <p>Bạn có thể thử thanh toán lại từ trang đơn hàng.</p>
                    </>
                )}

                <Link
                    to="/"
                    style={{
                        color: "#007bff",
                        fontSize: "18px",
                        display: "inline-block",
                        marginTop: "30px",
                        textDecoration: "none",
                    }}
                >
                    ← Quay về trang chủ
                </Link>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutSuccess;
