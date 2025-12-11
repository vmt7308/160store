const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersByUser,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);
router.get("/user/:userId", authMiddleware, getOrdersByUser);

module.exports = router;
