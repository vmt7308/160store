const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../models/categoryModel");

// API: Lấy tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("❌ Lỗi lấy danh mục:", err);
    res.status(500).send("❌ Lỗi server!");
  }
});

module.exports = router;
