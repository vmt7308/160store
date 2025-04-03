const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
} = require("../models/productModel");

// API: Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    let products = await getAllProducts();
    products = products.map((product) => ({
      ...product,
      imageUrl: product.imagePath
        ? `http://localhost:5000/uploads/${product.imagePath}`
        : null,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi lấy sản phẩm:", err);
    res.status(500).json({ error: "❌ Lỗi server!" });
  }
});

// API: Lấy sản phẩm theo danh mục
router.get("/category/:id", async (req, res) => {
  try {
    let categoryId = parseInt(req.params.id);
    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: "❌ ID danh mục không hợp lệ!" });
    }

    let products = await getProductsByCategory(categoryId);
    products = products.map((product) => ({
      ...product,
      imageUrl: product.imagePath
        ? `http://localhost:5000/uploads/${product.imagePath}`
        : null,
    }));

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi lấy sản phẩm theo danh mục:", err);
    res.status(500).json({ error: "❌ Lỗi server!" });
  }
});

// API: Tìm kiếm sản phẩm với bộ lọc nâng cao
router.get("/search", async (req, res) => {
  try {
    let { keyword, categoryId, minPrice, maxPrice } = req.query;

    categoryId = categoryId ? parseInt(categoryId) : null;
    minPrice = minPrice ? Math.max(0, parseFloat(minPrice)) : null;
    maxPrice = maxPrice ? Math.max(0, parseFloat(maxPrice)) : null;

    // Kiểm tra nếu maxPrice nhỏ hơn minPrice
    if (maxPrice !== null && minPrice !== null && maxPrice < minPrice) {
      return res
        .status(400)
        .json({ error: "❌ Giá tối đa không thể nhỏ hơn giá tối thiểu!" });
    }

    let products = await searchProducts(
      keyword,
      categoryId,
      minPrice,
      maxPrice
    );
    products = products.map((product) => ({
      ...product,
      imageUrl: product.imagePath
        ? `http://localhost:5000/uploads/${product.imagePath}`
        : null,
    }));

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm sản phẩm:", err);
    res.status(500).json({ error: "❌ Lỗi server!" });
  }
});

module.exports = router;
