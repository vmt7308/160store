const express = require("express");
const router = express.Router();
const {
  login,
  getAdminById,
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
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/profile", authMiddleware, getAdminById);
router.put("/profile", authMiddleware, updateAdmin);
router.get("/users", authMiddleware, getAllUsers);
router.put("/users/:userId", authMiddleware, updateUser);
router.delete("/users/:userId", authMiddleware, deleteUser);
router.post("/categories", authMiddleware, createCategory);
router.put("/categories/:categoryId", authMiddleware, updateCategory);
router.delete("/categories/:categoryId", authMiddleware, deleteCategory);
router.post("/products", authMiddleware, createProduct);
router.put("/products/:productId", authMiddleware, updateProduct);
router.delete("/products/:productId", authMiddleware, deleteProduct);
router.get("/orders", authMiddleware, getAllOrders);
router.put("/orders/:orderId", authMiddleware, updateOrderStatus);
router.get("/stats", authMiddleware, getRevenueStats);

module.exports = router;
