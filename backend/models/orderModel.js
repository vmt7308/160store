const { poolPromise, sql } = require("../db");

// Tạo đơn hàng và chi tiết đơn hàng
exports.createOrder = async (orderData) => {
  const {
    UserID,
    TotalAmount,
    PaymentMethod,
    OrderNotes,
    VoucherCode,
    OrderDetails,
  } = orderData;

  try {
    const pool = await poolPromise;

    // Tạo đơn hàng
    const orderResult = await pool
      .request()
      .input("UserID", sql.Int, UserID)
      .input("TotalAmount", sql.Decimal(10, 2), TotalAmount)
      .input("PaymentMethod", sql.NVarChar, PaymentMethod)
      .input("OrderNotes", sql.NVarChar, OrderNotes)
      .input("VoucherCode", sql.NVarChar, VoucherCode)
      .query(
        "INSERT INTO Orders (UserID, TotalAmount, PaymentMethod, OrderNotes, VoucherCode) OUTPUT INSERTED.OrderID VALUES (@UserID, @TotalAmount, @PaymentMethod, @OrderNotes, @VoucherCode)"
      );

    const orderId = orderResult.recordset[0].OrderID;

    // Tạo chi tiết đơn hàng
    for (const detail of OrderDetails) {
      await pool
        .request()
        .input("OrderID", sql.Int, orderId)
        .input("ProductID", sql.Int, detail.ProductID)
        .input("Quantity", sql.Int, detail.Quantity)
        .input("UnitPrice", sql.Decimal(10, 2), detail.UnitPrice)
        .query(
          "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)"
        );
    }

    return orderId;
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
};
