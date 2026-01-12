const axios = require("axios");
const crypto = require("crypto");
const { poolPromise, sql } = require("../db");

// Test keys công khai từ MoMo sandbox (chỉ dùng để test, không nhận tiền thật)
const partnerCode = "MOMOUDLU20220629";
const accessKey = "ggoaaJa1ECRzBRYC";
const secretKey = "nI4o1MBg53oY5MWP3IHnYcxoUD2x2dm8";

// Cấu hình callback
const redirectUrl = "http://localhost:3000/checkout/success"; // Trang success sau khi thanh toán test
const ipnUrl = "https://c264b6e31015.ngrok-free.app/api/momo/ipn"; // MoMo gọi về BE khi thanh toán (tùy chọn)
const requestType = "captureWallet"; // Loại thanh toán test

// Hàm tạo thanh toán MoMo test - NHẬN ORDERID THẬT TỪ FE
exports.createMoMoPayment = async (req, res) => {
    let { orderId, amount, orderInfo } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Số tiền không hợp lệ!" });
    }

    if (!orderId) {
        return res.status(400).json({ message: "orderId là bắt buộc!" });
    }

    // Tạo requestId duy nhất
    const requestId = partnerCode + new Date().getTime();

    // Dùng orderId thật từ FE (ví dụ: ORDER_123 hoặc số từ DB)
    const orderIdMomo = orderId; // ĐÃ FIX: Dùng orderId thật, không fallback TEST_

    // Mô tả đơn hàng (nếu FE không gửi thì dùng default)
    const finalOrderInfo = orderInfo || `Thanh toán đơn hàng #${orderId} tại 160STORE`;

    const extraData = ""; // Có thể dùng để lưu thêm data nếu cần

    // Tạo raw signature theo đúng thứ tự yêu cầu của MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderIdMomo}&orderInfo=${finalOrderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Tạo signature HMAC SHA256
    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    // Body gửi đến MoMo test sandbox
    const requestBody = {
        partnerCode,
        partnerName: "160STORE Test",
        storeId: "160StoreTest",
        requestId,
        amount,
        orderId: orderIdMomo,
        orderInfo: finalOrderInfo,
        redirectUrl,
        ipnUrl,
        lang: "vi",
        extraData,
        requestType,
        signature,
    };

    try {
        // Gọi API MoMo test
        const response = await axios.post(
            "https://test-payment.momo.vn/v2/gateway/api/create",
            requestBody
        );

        // Trả về payUrl để FE redirect
        res.json({ payUrl: response.data.payUrl });
    } catch (error) {
        console.error("Lỗi tạo thanh toán MoMo test:", error.response?.data || error.message);
        res.status(500).json({ message: "Lỗi kết nối MoMo test!" });
    }
};

// IPN callback - MoMo gọi về khi thanh toán test thành công
exports.momoIPN = async (req, res) => {
  try {
    console.log("MoMo IPN received:", req.body);

    const { resultCode, orderId, amount, extraData } = req.body;

    if (resultCode === 0) {
      // Thanh toán test thành công → update PaymentStatus = 'Paid'
      const realOrderId = orderId.replace("ORDER_", ""); // Lấy OrderID thật từ ORDER_XX

      const pool = await poolPromise;
      await pool.request()
        .input("OrderID", sql.Int, realOrderId)
        .input("PaymentStatus", sql.NVarChar, "Paid")
        .query(`
          UPDATE Orders 
          SET PaymentStatus = @PaymentStatus 
          WHERE OrderID = @OrderID
        `);

      console.log(`✅ Thanh toán MoMo thành công cho đơn #${realOrderId}, số tiền: ${amount}đ`);
    } else {
      console.log(`❌ Thanh toán MoMo thất bại cho đơn: ${orderId}, code: ${resultCode}`);
    }

    // Luôn trả OK cho MoMo (yêu cầu bắt buộc)
    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("❌ Lỗi xử lý IPN MoMo:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
