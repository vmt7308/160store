const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersByUser,
  cancelOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);
router.get("/user/:userId", authMiddleware, getOrdersByUser);
router.post("/cancel/:orderId", authMiddleware, cancelOrder);

module.exports = router;
