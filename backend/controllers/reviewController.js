const { poolPromise, sql } = require("../db");
const fs = require("fs");
const path = require("path");

// THÊM ĐÁNH GIÁ
exports.addReview = async (req, res) => {
    const { orderId, productId, rating, comment, imageBase64 } = req.body;
    const userId = req.user.userId;
    const fullName = req.user.fullName || "Khách hàng";

    let imageURL = null;

    try {
        const pool = await poolPromise;

        // KIỂM TRA ĐÃ ĐÁNH GIÁ ĐƠN HÀNG NÀY CHƯA
        const checkResult = await pool.request()
            .input("OrderID", sql.Int, orderId)
            .input("UserID", sql.Int, userId)
            .query("SELECT ReviewID FROM Reviews WHERE OrderID = @OrderID AND UserID = @UserID");

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ message: "Bạn đã đánh giá đơn hàng này rồi!" });
        }

        // XỬ LÝ ẢNH BASE64 (nếu có)
        if (imageBase64) {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const filename = `review-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filePath = path.join(__dirname, "../uploads", filename);
            fs.writeFileSync(filePath, buffer);
            imageURL = `/uploads/${filename}`;
        }

        // THÊM ĐÁNH GIÁ MỚI
        await pool.request()
            .input("OrderID", sql.Int, orderId)
            .input("ProductID", sql.Int, productId)
            .input("UserID", sql.Int, userId)
            .input("Rating", sql.Int, rating)
            .input("Comment", sql.NVarChar, comment)
            .input("FullName", sql.NVarChar, fullName)
            .input("ImageURL", sql.NVarChar, imageURL)
            .query(`
        INSERT INTO Reviews (OrderID, ProductID, UserID, Rating, Comment, FullName, ImageURL)
        VALUES (@OrderID, @ProductID, @UserID, @Rating, @Comment, @FullName, @ImageURL)
      `);

        res.json({ message: "Đánh giá thành công!" });
    } catch (error) {
        console.error("Lỗi thêm review:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

// LẤY DANH SÁCH ORDERID ĐÃ ĐÁNH GIÁ CỦA USER
exports.getReviewedOrders = async (req, res) => {
    const userId = req.user.userId;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT DISTINCT OrderID FROM Reviews WHERE UserID = @UserID");

        const reviewedOrderIds = result.recordset.map(row => row.OrderID);
        res.json(reviewedOrderIds);
    } catch (error) {
        console.error("Lỗi lấy danh sách đánh giá:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};