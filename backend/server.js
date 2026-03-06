const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const listCategoryRoute = require("./routes/listCategoryRoute");
const listProductRoute = require("./routes/listProductRoute");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const momoController = require("./controllers/momoController");

const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware: Cho phép FE truy cập
// FIX CORS – CHO PHÉP localhost:3000 GỌI localhost:5000
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Cho phép gửi cookie/token
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

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
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.post("/api/momo/create", momoController.createMoMoPayment);
app.post("/api/momo/ipn", momoController.momoIPN);

app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
