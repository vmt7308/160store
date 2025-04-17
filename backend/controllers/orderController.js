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
