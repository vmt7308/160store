const express = require("express");
const router = express.Router();
const productModel = require("../models/listProductModel");

router.get("/", async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    if (!categoryId) {
      return res.status(400).json({ error: "CategoryId is required" });
    }
    const products = await productModel.getProductsByCategory(categoryId);
    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm" });
  }
});

module.exports = router;
