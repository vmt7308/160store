const { createOrder } = require("../models/orderModel");

// Tạo đơn hàng
exports.createOrder = async (req, res) => {
  try {
    const {
      UserID,
      TotalAmount,
      PaymentMethod,
      OrderNotes,
      VoucherCode,
      OrderDetails,
    } = req.body;

    if (
      !UserID ||
      !TotalAmount ||
      !PaymentMethod ||
      !OrderDetails ||
      OrderDetails.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Thông tin đơn hàng không hợp lệ!" });
    }

    const orderId = await createOrder({
      UserID,
      TotalAmount,
      PaymentMethod,
      OrderNotes,
      VoucherCode,
      OrderDetails,
    });

    res.status(201).json({ message: "Tạo đơn hàng thành công!", orderId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};
