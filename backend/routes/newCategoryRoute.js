const express = require("express");
const router = express.Router();
const categoryModel = require("../models/newCategoryModel");

router.get("/", async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh mục" });
  }
});

module.exports = router;
