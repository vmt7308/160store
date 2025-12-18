const express = require("express");
const router = express.Router();
const { addReview, getReviewedOrders } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// THÊM ĐÁNH GIÁ
router.post("/", authMiddleware, addReview);

// LẤY DANH SÁCH ORDERID ĐÃ ĐÁNH GIÁ
router.get("/user-orders", authMiddleware, getReviewedOrders);

module.exports = router;