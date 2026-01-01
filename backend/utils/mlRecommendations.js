// Utils cho recommendations ML (content-based filtering đơn giản).
// Sử dụng ml-matrix để compute similarity (dựa price, category).
// Ghi chú: Query DB để lấy data, compute recs dựa user orders. Giữ simple, no heavy ML.

const { Matrix } = require('ml-matrix');
const { poolPromise } = require('../db');  // Dùng connect DB hiện có

async function getRecommendations(userId) {
    const pool = await poolPromise;
    // Lấy orders của user
    const orders = await pool.request().query(`SELECT ProductID FROM OrderDetails WHERE OrderID IN (SELECT OrderID FROM Orders WHERE UserID = ${userId || 1})`);

    if (!orders.recordset.length) {
        // Default recs nếu no history
        const defaultRecs = await pool.request().query(`SELECT TOP 5 ProductName FROM Products WHERE CategoryID = 2`);  // Hot category
        return defaultRecs.recordset.map(p => p.ProductName);
    }

    // Simple similarity: Giả sử matrix price
    const products = await pool.request().query(`SELECT ProductID, Price FROM Products`);
    const data = products.recordset.map(p => [p.Price]);
    const simMatrix = Matrix.fromArray(data).cosineSimilarity();  // Cosine sim placeholder

    // Get top 5 similar
    return ['Gợi ý 1', 'Gợi ý 2', 'Gợi ý 3', 'Gợi ý 4', 'Gợi ý 5'];  // Expand thực tế
}

module.exports = { getRecommendations };