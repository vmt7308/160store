const { createOrder } = require("../models/orderModel");
const { poolPromise, sql } = require("../db");

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

// Get orders by user ID
exports.getOrdersByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.Int, userId).query(`
        SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.Status,
               od.OrderDetailID, od.ProductID, od.Quantity, od.UnitPrice,
               p.ProductName
        FROM Orders o
        LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
        LEFT JOIN Products p ON od.ProductID = p.ProductID
        WHERE o.UserID = @UserID
      `);

    const orders = [];
    const orderMap = {};

    result.recordset.forEach((row) => {
      if (!orderMap[row.OrderID]) {
        orderMap[row.OrderID] = {
          OrderID: row.OrderID,
          OrderDate: row.OrderDate,
          TotalAmount: row.TotalAmount,
          Status: row.Status,
          OrderDetails: [],
        };
        orders.push(orderMap[row.OrderID]);
      }
      if (row.OrderDetailID) {
        orderMap[row.OrderID].OrderDetails.push({
          OrderDetailID: row.OrderDetailID,
          ProductID: row.ProductID,
          ProductName: row.ProductName,
          Quantity: row.Quantity,
          UnitPrice: row.UnitPrice,
        });
      }
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId; // Từ authMiddleware

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("OrderID", sql.Int, orderId)
      .query("SELECT Status, UserID FROM Orders WHERE OrderID = @OrderID");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }

    const order = result.recordset[0];
    if (order.UserID !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền hủy đơn này!" });
    }
    if (order.Status !== "Pending") {
      return res.status(400).json({ message: "Đơn hàng không thể hủy!" });
    }

    await pool.request()
      .input("OrderID", sql.Int, orderId)
      .query("UPDATE Orders SET Status = 'Cancelled' WHERE OrderID = @OrderID");

    res.json({ message: "Hủy đơn hàng thành công!" });
  } catch (error) {
    console.error("❌ Lỗi hủy đơn:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};