const express = require("express");
const {
  getAllProducts,
  getProductsByCategory,
} = require("../models/productModel");

const router = express.Router();

// API: Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    let products = await getAllProducts();
    products = products.map((product) => ({
      ...product,
      imageUrl: `http://localhost:5000/uploads/${product.imagePath}`,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi lấy sản phẩm:", err);
    res.status(500).send("❌ Lỗi server!");
  }
});

// API: Lấy sản phẩm theo danh mục
router.get("/category/:id", async (req, res) => {
  try {
    let categoryId = req.params.id;
    let products = await getProductsByCategory(categoryId);
    products = products.map((product) => ({
      ...product,
      imageUrl: `http://localhost:5000/uploads/${product.imagePath}`,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi lấy sản phẩm theo danh mục:", err);
    res.status(500).send("❌ Lỗi server!");
  }
});

module.exports = router;
