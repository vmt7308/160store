const { poolPromise, sql } = require("../db");

// Tìm tài khoản Admin bằng email
exports.findAdminByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Admins WHERE Email = @Email");
    return result.recordset[0];
  } catch (error) {
    console.error("❌ Lỗi khi tìm admin:", error);
    throw error;
  }
};

// Tìm tài khoản Admin theo ID
exports.findAdminById = async (adminId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("AdminID", sql.Int, adminId)
      .query("SELECT * FROM Admins WHERE AdminID = @AdminID");
    return result.recordset[0];
  } catch (error) {
    console.error("❌ Lỗi khi tìm admin theo ID:", error);
    throw error;
  }
};

// Cập nhật thông tin Admin
exports.updateAdmin = async (adminId, fullName, email) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("AdminID", sql.Int, adminId)
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .query(
        "UPDATE Admins SET FullName = @FullName, Email = @Email WHERE AdminID = @AdminID"
      );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật admin:", error);
    throw error;
  }
};

// Quản lý user khách hàng
exports.getAllUsers = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Users");
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách user:", error);
    throw error;
  }
};

// Cập nhật thông tin khách hàng
exports.updateUser = async (userId, fullName, email, phoneNumber, address) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("PhoneNumber", sql.NVarChar, phoneNumber)
      .input("Address", sql.NVarChar, address)
      .query(
        "UPDATE Users SET FullName = @FullName, Email = @Email, PhoneNumber = @PhoneNumber, Address = @Address WHERE UserID = @UserID"
      );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật user:", error);
    throw error;
  }
};

// Xóa 1 khách hàng
exports.deleteUser = async (userId) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Users WHERE UserID = @UserID");
  } catch (error) {
    console.error("❌ Lỗi khi xóa user:", error);
    throw error;
  }
};

// Tạo danh mục sản phẩm
exports.createCategory = async (categoryName) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("CategoryName", sql.NVarChar, categoryName)
      .query(
        "INSERT INTO Categories (CategoryName) OUTPUT INSERTED.CategoryID VALUES (@CategoryName)"
      );
    return result.recordset[0].CategoryID;
  } catch (error) {
    console.error("� koc Lỗi khi tạo danh mục:", error);
    throw error;
  }
};

// Cập nhật danh mục sản phẩm
exports.updateCategory = async (categoryId, categoryName) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("CategoryID", sql.Int, categoryId)
      .input("CategoryName", sql.NVarChar, categoryName)
      .query(
        "UPDATE Categories SET CategoryName = @CategoryName WHERE CategoryID = @CategoryID"
      );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật danh mục:", error);
    throw error;
  }
};

// Xóa danh mục
exports.deleteCategory = async (categoryId) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("CategoryID", sql.Int, categoryId)
      .query("DELETE FROM Categories WHERE CategoryID = @CategoryID");
  } catch (error) {
    console.error("❌ Lỗi khi xóa danh mục:", error);
    throw error;
  }
};

// Tạo sản phẩm
exports.createProduct = async (
  categoryId,
  productName,
  imageUrl,
  price,
  descriptions
) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("_CategoryID", sql.Int, categoryId)
      .input("ProductName", sql.NVarChar, productName)
      .input("ImageURL", sql.NVarChar, imageUrl)
      .input("Price", sql.Decimal(10, 2), price)
      .input("Descriptions", sql.NVarChar, descriptions)
      .query(
        "INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Descriptions) OUTPUT INSERTED.ProductID VALUES (@CategoryID, @ProductName, @ImageURL, @Price, @Descriptions)"
      );
    return result.recordset[0].ProductID;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (
  productId,
  categoryId,
  productName,
  imageUrl,
  price,
  descriptions
) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("ProductID", sql.Int, productId)
      .input("CategoryID", sql.Int, categoryId)
      .input("ProductName", sql.NVarChar, productName)
      .input("ImageURL", sql.NVarChar, imageUrl)
      .input("Price", sql.Decimal(10, 2), price)
      .input("Descriptions", sql.NVarChar, descriptions)
      .query(
        "UPDATE Products SET CategoryID = @CategoryID, ProductName = @ProductName, ImageURL = @ImageURL, Price = @Price, Descriptions = @Descriptions WHERE ProductID = @ProductID"
      );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (productId) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM Products WHERE ProductID = @ProductID");
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};

// Quản lý sản phẩm mà khách hàng đã order
exports.getAllOrders = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT o.OrderID, o.UserID, o.OrderDate, o.TotalAmount, o.Status, o.PaymentMethod, o.OrderNotes, o.VoucherCode,
             od.OrderDetailID, od.ProductID, od.Quantity, od.UnitPrice,
             p.ProductName, u.FullName, u.Email
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      LEFT JOIN Products p ON od.ProductID = p.ProductID
      LEFT JOIN Users u ON o.UserID = u.UserID
    `);
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (orderId, status) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("OrderID", sql.Int, orderId)
      .input("Status", sql.NVarChar, status)
      .query("UPDATE Orders SET Status = @Status WHERE OrderID = @OrderID");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", error);
    throw error;
  }
};

// Báo cáo thống kê doanh thu
exports.getRevenueStats = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT FORMAT(OrderDate, 'yyyy-MM') AS Month, SUM(TotalAmount) AS TotalRevenue
      FROM Orders
      GROUP BY FORMAT(OrderDate, 'yyyy-MM')
    `);
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê doanh thu:", error);
    throw error;
  }
};
