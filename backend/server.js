const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const listCategoryRoute = require("./routes/listCategoryRoute");
const listProductRoute = require("./routes/listProductRoute");

const app = express();

// Middleware: Cho phép FE truy cập
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Cho phép truy cập ảnh từ thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("🚀 160store API is running!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/list-categories", listCategoryRoute);
app.use("/api/list-products", listProductRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
