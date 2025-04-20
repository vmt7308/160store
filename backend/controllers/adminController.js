const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  findAdminByEmail,
  findAdminById,
  updateAdmin,
  getAllUsers,
  updateUser,
  deleteUser,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getRevenueStats,
} = require("../models/adminModel");
require("dotenv").config();

// Đăng nhập admin
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });
    }

    const token = jwt.sign({ adminId: admin.AdminID }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      admin: {
        id: admin.AdminID,
        email: admin.Email,
        fullName: admin.FullName,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập admin:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};

// Lấy thông tin admin
exports.getAdminById = async (req, res) => {
  const adminId = req.admin.adminId;

  try {
    const admin = await findAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin!" });
    }

    const { PasswordHash, ...adminData } = admin;
    res.json(adminData);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin admin:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Cập nhật thông tin admin
exports.updateAdmin = async (req, res) => {
  const adminId = req.admin.adminId;
  const { fullName, email } = req.body;

  try {
    await updateAdmin(adminId, fullName, email);
    res.json({ message: "Cập nhật thông tin admin thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật admin:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Quản lý khách hàng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Cập nhật thông tin khách hàng
exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { fullName, email, phoneNumber, address } = req.body;

  try {
    await updateUser(userId, fullName, email, phoneNumber, address);
    res.json({ message: "Cập nhật thông tin user thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xóa một khách hàng
exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    await deleteUser(userId);
    res.json({ message: "Xóa user thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Tạo danh mục
exports.createCategory = async (req, res) => {
  const { categoryName } = req.body;

  try {
    const categoryId = await createCategory(categoryName);
    res.status(201).json({ message: "Tạo danh mục thành công!", categoryId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Update danh mục sản phẩm
exports.updateCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  const { categoryName } = req.body;

  try {
    await updateCategory(categoryId, categoryName);
    res.json({ message: "Cập nhật danh mục thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xóa danh mục sản phẩm
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    await deleteCategory(categoryId);
    res.json({ message: "Xóa danh mục thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Tạo sản phẩm
exports.createProduct = async (req, res) => {
  const { categoryId, productName, imageUrl, price, descriptions } = req.body;

  try {
    const productId = await createProduct(
      categoryId,
      productName,
      imageUrl,
      price,
      descriptions
    );
    res.status(201).json({ message: "Tạo sản phẩm thành công!", productId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Update sản phẩm
exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const { categoryId, productName, imageUrl, price, descriptions } = req.body;

  try {
    await updateProduct(
      productId,
      categoryId,
      productName,
      imageUrl,
      price,
      descriptions
    );
    res.json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    await deleteProduct(productId);
    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Quản lý đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    const orderMap = {};
    const result = [];

    orders.forEach((row) => {
      if (!orderMap[row.OrderID]) {
        orderMap[row.OrderID] = {
          OrderID: row.OrderID,
          UserID: row.UserID,
          FullName: row.FullName,
          Email: row.Email,
          OrderDate: row.OrderDate,
          TotalAmount: row.TotalAmount,
          Status: row.Status,
          PaymentMethod: row.PaymentMethod,
          OrderNotes: row.OrderNotes,
          VoucherCode: row.VoucherCode,
          OrderDetails: [],
        };
        result.push(orderMap[row.OrderID]);
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

    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    await updateOrderStatus(orderId, status);
    res.json({ message: "Cập nhật trạng thái đơn hàng thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Báo cáo Thống kê doanh thu
exports.getRevenueStats = async (req, res) => {
  try {
    const stats = await getRevenueStats();
    res.json(stats);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê doanh thu:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
