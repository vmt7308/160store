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
    console.error("❌ Lỗi khi tìm admin bằng email:", error);
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

// Cập nhật thông tin Admin (hỗ trợ đổi password - chỉ cập nhật trường không null)
exports.updateAdmin = async (adminId, fullName, passwordHash = null) => {
  try {
    const pool = await poolPromise;
    const request = pool.request()
      .input("AdminID", sql.Int, adminId);

    let query = "UPDATE Admins SET ";
    const fields = [];

    // Nếu có fullName thì thêm vào query
    if (fullName !== undefined && fullName !== null && fullName.trim() !== "") {
      fields.push("FullName = @FullName");
      request.input("FullName", sql.NVarChar, fullName.trim());
    }

    // Nếu có passwordHash thì thêm vào query
    if (passwordHash !== undefined && passwordHash !== null) {
      fields.push("PasswordHash = @PasswordHash");
      request.input("PasswordHash", sql.NVarChar, passwordHash);
    }

    // Nếu không có trường nào để cập nhật => báo lỗi
    if (fields.length === 0) {
      throw new Error("Không có thông tin nào để cập nhật.");
    }

    // Ghép query và thêm WHERE
    query += fields.join(", ") + " WHERE AdminID = @AdminID";

    await request.query(query);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật admin:", error);
    throw error;
  }
};

// Quản lý user khách hàng - lọc bỏ IsDeleted = 1 (không hiển thị user đã xóa mềm)
exports.getAllUsers = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Users WHERE IsDeleted = 0");
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy users:", error);
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

// Soft delete user (set IsDeleted = 1)
exports.softDeleteUser = async (userId) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("UPDATE Users SET IsDeleted = 1 WHERE UserID = @UserID");
  } catch (error) {
    console.error("❌ Lỗi khi soft delete user:", error);
    throw error;
  }
};

// Soft delete tất cả reviews của user (set IsDeleted = 1)
exports.softDeleteReviewsByUser = async (userId) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("UPDATE Reviews SET IsDeleted = 1 WHERE UserID = @UserID");
  } catch (error) {
    console.error("❌ Lỗi khi soft delete reviews của user:", error);
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
    console.error("❌ Lỗi khi tạo danh mục:", error);
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
      .input("CategoryID", sql.Int, categoryId)
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
      SELECT o.OrderID, o.UserID, o.OrderDate, o.TotalAmount, o.Status, o.PaymentMethod, o.OrderNotes, o.VoucherCode, o.PaymentStatus,
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

// Báo cáo thống kê doanh thu (Chỉ tính doanh thu với điều kiện giao hàng thành công = Delivered và thanh toán thành công qua momo = Paid, loại hủy bỏ đơn = Cancelled)
exports.getRevenueStats = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        FORMAT(OrderDate, 'yyyy-MM') AS Month,
        SUM(TotalAmount) AS TotalRevenue
      FROM Orders
      WHERE 
        Status = 'Delivered'          -- Chỉ đơn đã giao thành công
        AND PaymentStatus = 'Paid'    -- Chỉ đơn thanh toán MoMo thành công
        AND Status != 'Cancelled'     -- Loại bỏ hoàn toàn đơn hủy
      GROUP BY FORMAT(OrderDate, 'yyyy-MM')
      ORDER BY Month
    `);
    return result.recordset; // Trả mảng: [{Month: '2025-01', TotalRevenue: 500000}, ...]
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê doanh thu:", error);
    throw error;
  }
};

// Tính tổng doanh thu toàn thời gian (chỉ Delivered + Paid, loại Cancelled)
exports.getTotalRevenue = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ISNULL(SUM(TotalAmount), 0) AS TotalRevenue
      FROM Orders
      WHERE 
        Status = 'Delivered' 
        AND PaymentStatus = 'Paid' 
        AND Status != 'Cancelled'
    `);
    return result.recordset[0]?.TotalRevenue || 0;
  } catch (error) {
    console.error("❌ Lỗi khi lấy tổng doanh thu:", error);
    throw error;
  }
};

// Reviews - Đánh giá và bình luận sản phẩm sau khi mua (lọc IsDeleted = 0)
exports.getAllReviews = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.ReviewID, r.OrderID, r.ProductID, r.UserID, r.Rating, r.Comment, r.FullName, r.ImageURL, r.CreatedAt,
             p.ProductName, u.FullName AS UserFullName
      FROM Reviews r
      LEFT JOIN Products p ON r.ProductID = p.ProductID
      LEFT JOIN Users u ON r.UserID = u.UserID
      WHERE r.IsDeleted = 0  -- Chỉ lấy các review chưa bị xóa mềm
    `);
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách reviews:", error);
    throw error;
  }
};

// Xóa đánh giá xấu
exports.deleteReview = async (reviewId) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("ReviewID", sql.Int, reviewId)
      .query("DELETE FROM Reviews WHERE ReviewID = @ReviewID");
  } catch (error) {
    console.error("❌ Lỗi khi xóa review:", error);
    throw error;
  }
};

// Newsletter - Đăng ký nhận tin
exports.getAllNewsletter = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Newsletter");
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách newsletter:", error);
    throw error;
  }
};