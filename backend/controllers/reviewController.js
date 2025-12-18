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

            // ĐƯỜNG DẪN THƯ MỤC UPLOADS
            const uploadDir = path.join(__dirname, "../uploads");

            // TỰ ĐỘNG TẠO THƯ MỤC uploads NẾU CHƯA TỒN TẠI
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
                console.log("Thư mục 'uploads' đã được tạo tự động!");
            }

            // LƯU ẢNH VÀO THƯ MỤC uploads
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);

            imageURL = `/uploads/${filename}`;
        }

        // THÊM ĐÁNH GIÁ MỚI VÀO DATABASE
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

// LẤY DANH SÁCH ĐÁNH GIÁ CHO 1 SẢN PHẨM (VỚI TÊN, EMAIL CHE, VÀ ẢNH THỰC TẾ)
exports.getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProductID", sql.Int, productId)
            .query(`
                SELECT 
                r.ReviewID, 
                r.Rating, 
                r.Comment, 
                u.FullName AS CustomerName,
                u.Email,
                r.ImageURL,
                r.CreatedAt
                FROM Reviews r
                INNER JOIN Users u ON r.UserID = u.UserID
                WHERE r.ProductID = @ProductID
                ORDER BY r.CreatedAt DESC
            `);

        // Định dạng email che + trả về ImageURL
        const reviews = result.recordset.map(row => {
            let maskedEmail = "";
            if (row.Email) {
                const [localPart, domain] = row.Email.split('@');
                const maskedLocal = localPart.length > 3
                    ? localPart.slice(0, 3) + '***'
                    : localPart.slice(0, localPart.length - 1) + '***';
                maskedEmail = `${maskedLocal}@${domain}`;
            }

            return {
                ReviewID: row.ReviewID,
                Rating: row.Rating,
                Comment: row.Comment,
                FullName: row.CustomerName || "Khách hàng",
                MaskedEmail: maskedEmail,
                ImageURL: row.ImageURL,  // Có thể null
                CreatedAt: row.CreatedAt
            };
        });

        res.json(reviews);
    } catch (error) {
        console.error("Lỗi lấy đánh giá sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};