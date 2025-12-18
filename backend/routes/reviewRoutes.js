const express = require("express");
const router = express.Router();
const { addReview, getReviewedOrders, getProductReviews } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// THÊM ĐÁNH GIÁ
router.post("/", authMiddleware, addReview);

// LẤY DANH SÁCH ORDERID ĐÃ ĐÁNH GIÁ
router.get("/user-orders", authMiddleware, getReviewedOrders);

// LẤY ĐÁNH GIÁ CHO SẢN PHẨM
router.get("/product/:productId", getProductReviews);

module.exports = router;